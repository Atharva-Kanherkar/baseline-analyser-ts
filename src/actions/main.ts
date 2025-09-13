import * as core from '@actions/core';
import * as github from '@actions/github';
import { BaselineAnalyzer } from '../core/analyzer.js';
import { AnalyzerConfig, CodeChange } from '../core/types.js';
import { logger } from '../utils/logger.js';
import { debugGitHubPayload, debugNpmPackages } from '../utils/debug.js';

/**
 * GitHub Actions Integration - The Complete Wrapper
 * 
 * This is the entry point for GitHub Actions that:
 * 1. Handles PR webhooks and events
 * 2. Fetches PR data and diff information
 * 3. Runs the complete analysis pipeline
 * 4. Posts results back to GitHub
 * 5. Sets appropriate exit codes for blocking
 */

/**
 * Main GitHub Actions entry point
 */
export async function run(): Promise<void> {
  try {
    logger.info('🚀 GitHub Actions Baseline Analyzer starting...');
    
    // DEBUG: Test NPM packages in development
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PACKAGES === 'true') {
      await debugNpmPackages();
    }
    
    // Get configuration from GitHub Actions inputs
    const config = getConfigFromInputs();
    
    // Get PR context from GitHub event
    const { prData, prNumber } = getPRContext();
    
    // DEBUG: Log actual GitHub payload structure in development
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PAYLOAD === 'true') {
      debugGitHubPayload(github.context.payload);
    }
    
    // Fetch PR diff data
    const codeChanges = await fetchPRChanges(config.githubToken, prNumber);
    
    // Run the complete analysis
    const analyzer = new BaselineAnalyzer(config);
    const result = await analyzer.analyze(prData, codeChanges);
    
    // Post results to GitHub
    await postResultsToGitHub(config.githubToken, prNumber, result);
    
    // Set exit code based on decision
    if (result.decision.shouldBlock) {
      core.setFailed(result.decision.message);
      process.exit(1);
    } else {
      core.info(`✅ Analysis complete: ${result.decision.message}`);
      process.exit(0);
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('GitHub Actions run failed', error);
    core.setFailed(`Baseline analyzer failed: ${errorMessage}`);
    process.exit(1);
  }
}

/**
 * Gets analyzer configuration from GitHub Actions inputs
 */
function getConfigFromInputs(): AnalyzerConfig {
  const targetBrowsers = core.getInput('target-browsers')
    .split(',')
    .map((browser: string) => browser.trim())
    .filter((browser: string) => browser.length > 0);
  
  if (targetBrowsers.length === 0) {
    // Default browsers if none specified
    targetBrowsers.push('chrome >= 90', 'firefox >= 88', 'safari >= 14', 'edge >= 90');
  }
  
  const config: AnalyzerConfig = {
    targetBrowsers,
    blockingLevel: (core.getInput('blocking-level') as any) || 'HIGH',
    largePRThreshold: parseInt(core.getInput('large-pr-threshold') || '20'),
    hugePRThreshold: parseInt(core.getInput('huge-pr-threshold') || '50'),
    enableAIReview: core.getBooleanInput('enable-ai-review'),
    githubToken: core.getInput('github-token') || process.env.GITHUB_TOKEN || '',
    openaiApiKey: core.getInput('openai-api-key') || process.env.OPENAI_API_KEY,
  };
  
  logger.info(`Configuration: ${config.targetBrowsers.length} browsers, ${config.blockingLevel} blocking level`);
  
  return config;
}

/**
 * Gets PR context from GitHub event data
 */
function getPRContext(): { prData: any; prNumber: number } {
  const { context } = github;
  
  if (context.eventName !== 'pull_request' && context.eventName !== 'pull_request_target') {
    throw new Error(`This action only supports pull request events, got: ${context.eventName}`);
  }
  
  const prData = context.payload.pull_request;
  if (!prData) {
    throw new Error('No pull request data found in GitHub event');
  }
  
  const prNumber = prData.number;
  logger.info(`Analyzing PR #${prNumber}: "${prData.title}"`);
  
  return { prData, prNumber };
}

/**
 * Fetches PR changes using GitHub API
 */
async function fetchPRChanges(githubToken: string, prNumber: number): Promise<CodeChange[]> {
  const { context } = github;
  const octokit = github.getOctokit(githubToken);
  
  logger.info(`Fetching changes for PR #${prNumber}`);
  
  try {
    // Get PR files
    const { data: files } = await octokit.rest.pulls.listFiles({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber,
      per_page: 100, // GitHub API limit
    });
    
    logger.info(`Found ${files.length} changed files`);
    
    const codeChanges: CodeChange[] = [];
    
    // Process each file to extract line-by-line changes
    for (const file of files) {
      if (file.status === 'removed') {
        continue; // Skip deleted files
      }
      
      const fileChanges = await extractChangesFromPatch(file.filename, file.patch || '');
      codeChanges.push(...fileChanges);
    }
    
    logger.info(`Extracted ${codeChanges.length} individual code changes`);
    
    return codeChanges;
    
  } catch (error) {
    logger.error('Failed to fetch PR changes', error);
    throw new Error(`Failed to fetch PR changes: ${error}`);
  }
}

/**
 * Extracts line-by-line changes from a Git patch
 */
async function extractChangesFromPatch(filename: string, patch: string): Promise<CodeChange[]> {
  const changes: CodeChange[] = [];
  
  if (!patch) {
    return changes;
  }
  
  const lines = patch.split('\n');
  let currentLine = 0;
  
  for (const line of lines) {
    // Parse patch header to get line numbers
    if (line.startsWith('@@')) {
      const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match && match[1]) {
        currentLine = parseInt(match[1]) - 1; // -1 because we increment before using
      }
      continue;
    }
    
    // Skip context lines and file headers
    if (line.startsWith('diff ') || line.startsWith('index ') || line.startsWith('+++') || line.startsWith('---')) {
      continue;
    }
    
    currentLine++;
    
    // Process added lines
    if (line.startsWith('+') && !line.startsWith('+++')) {
      const content = line.substring(1); // Remove the '+' prefix
      changes.push({
        file: filename,
        line: content,
        lineNumber: currentLine,
        type: 'ADDED',
      });
    }
    
    // Process modified lines (we treat these as additions for simplicity)
    if (line.startsWith(' ')) {
      // This is context - we could potentially analyze it too
      // For now, we only analyze added lines to be conservative
    }
  }
  
  return changes;
}

/**
 * Posts analysis results back to GitHub as a comment
 */
async function postResultsToGitHub(
  githubToken: string, 
  prNumber: number, 
  result: any
): Promise<void> {
  const { context } = github;
  const octokit = github.getOctokit(githubToken);
  
  logger.info('Posting results to GitHub');
  
  try {
    const comment = generateGitHubComment(result);
    
    await octokit.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: prNumber,
      body: comment,
    });
    
    logger.info('Results posted to GitHub successfully');
    
  } catch (error) {
    logger.error('Failed to post results to GitHub', error);
    // Don't fail the entire action if commenting fails
  }
}

/**
 * Generates a formatted GitHub comment with results
 */
function generateGitHubComment(result: any): string {
  const { decision, summary, risksFound, processingTime } = result;
  
  let comment = `## 🔍 Baseline Compatibility Analysis\n\n`;
  
  // Add decision header
  const icon = decision.shouldBlock ? '🚨' : summary.high > 0 ? '⚠️' : summary.medium > 0 ? '🔍' : '✅';
  comment += `${icon} **${decision.message}**\n\n`;
  
  // Add summary
  if (summary.critical + summary.high + summary.medium + summary.low > 0) {
    comment += `### Summary\n`;
    comment += `- 🚨 Critical: ${summary.critical}\n`;
    comment += `- ⚠️ High: ${summary.high}\n`;
    comment += `- 🔍 Medium: ${summary.medium}\n`;
    comment += `- 📝 Low: ${summary.low}\n\n`;
  }
  
  // Add detailed findings
  if (risksFound.length > 0) {
    comment += `### Detailed Findings\n\n`;
    
    for (const risk of risksFound.slice(0, 10)) { // Limit to avoid huge comments
      const riskIcon = risk.risk === 'CRITICAL' ? '🚨' : risk.risk === 'HIGH' ? '⚠️' : risk.risk === 'MEDIUM' ? '🔍' : '📝';
      
      comment += `#### ${riskIcon} \`${risk.feature.name}\` in \`${risk.feature.location.file}\`\n`;
      comment += `**Risk Level:** ${risk.risk}\n`;
      comment += `**Issue:** ${risk.reason}\n`;
      comment += `**Recommendation:** ${risk.recommendation}\n`;
      
      if (risk.feature.location.snippet) {
        comment += `**Code:**\n\`\`\`${getLanguageFromFile(risk.feature.location.file)}\n${risk.feature.location.snippet}\n\`\`\`\n`;
      }
      
      comment += `---\n\n`;
    }
    
    if (risksFound.length > 10) {
      comment += `_... and ${risksFound.length - 10} more ${risksFound.length - 10 === 1 ? 'issue' : 'issues'}_\n\n`;
    }
  }
  
  // Add footer
  comment += `<sub>⏱️ Analysis completed in ${processingTime}ms | 🤖 Powered by Baseline Analyzer</sub>`;
  
  return comment;
}

/**
 * Gets language identifier for code blocks based on file extension
 */
function getLanguageFromFile(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'html': 'html',
    'htm': 'html',
    'vue': 'vue',
    'svelte': 'svelte',
  };
  
  return languageMap[ext || ''] || 'text';
}

// Auto-run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}