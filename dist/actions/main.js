import * as core from '@actions/core';
import * as github from '@actions/github';
import { BaselineAnalyzer } from '../core/analyzer.js';
import { logger } from '../utils/logger.js';
import { debugGitHubPayload, debugWebPlatformAPI } from '../utils/debug.js';
function mapBlockingLevel(blockingLevel) {
    switch (blockingLevel.toLowerCase()) {
        case 'none':
            return 'IGNORE';
        case 'warning':
            return 'MEDIUM';
        case 'error':
            return 'HIGH';
        case 'critical':
            return 'CRITICAL';
        default:
            return 'MEDIUM';
    }
}
export async function run() {
    try {
        logger.info('🚀 GitHub Actions Baseline Analyzer starting...');
        if (process.env.NODE_ENV === 'development' || process.env.DEBUG_API === 'true') {
            await debugWebPlatformAPI();
        }
        const config = getConfigFromInputs();
        const { prData, prNumber } = getPRContext();
        if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PAYLOAD === 'true') {
            debugGitHubPayload(github.context.payload);
        }
        const codeChanges = await fetchPRChanges(config.githubToken, prNumber);
        const analyzer = new BaselineAnalyzer(config);
        const result = await analyzer.analyze(prData, codeChanges);
        await postResultsToGitHub(config.githubToken, prNumber, result);
        if (result.decision.shouldBlock) {
            core.setFailed(result.decision.message);
            process.exit(1);
        }
        else {
            core.info(`✅ Analysis complete: ${result.decision.message}`);
            process.exit(0);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('GitHub Actions run failed', error);
        core.setFailed(`Baseline analyzer failed: ${errorMessage}`);
        process.exit(1);
    }
}
function getConfigFromInputs() {
    const targetBrowsers = core.getInput('target-browsers')
        .split(',')
        .map((browser) => browser.trim())
        .filter((browser) => browser.length > 0);
    if (targetBrowsers.length === 0) {
        targetBrowsers.push('chrome >= 90', 'firefox >= 88', 'safari >= 14', 'edge >= 90');
    }
    const config = {
        targetBrowsers,
        blockingLevel: mapBlockingLevel(core.getInput('blocking-level') || 'warning'),
        largePRThreshold: parseInt(core.getInput('large-pr-threshold') || '20'),
        hugePRThreshold: parseInt(core.getInput('huge-pr-threshold') || '50'),
        enableAIReview: core.getBooleanInput('enable-ai-review'),
        githubToken: core.getInput('github-token') || process.env.GITHUB_TOKEN || '',
        openaiApiKey: core.getInput('openai-api-key') || process.env.OPENAI_API_KEY,
        perplexityApiKey: core.getInput('perplexity-api-key') || process.env.PERPLEXITY_API_KEY,
    };
    logger.info(`Configuration: ${config.targetBrowsers.length} browsers, ${config.blockingLevel} blocking level`);
    return config;
}
function getPRContext() {
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
async function fetchPRChanges(githubToken, prNumber) {
    const { context } = github;
    const octokit = github.getOctokit(githubToken);
    logger.info(`Fetching changes for PR #${prNumber}`);
    try {
        const { data: files } = await octokit.rest.pulls.listFiles({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: prNumber,
            per_page: 100,
        });
        logger.info(`Found ${files.length} changed files`);
        const codeChanges = [];
        for (const file of files) {
            if (file.status === 'removed') {
                continue;
            }
            const fileChanges = await extractChangesFromPatch(file.filename, file.patch || '');
            codeChanges.push(...fileChanges);
        }
        logger.info(`Extracted ${codeChanges.length} individual code changes`);
        return codeChanges;
    }
    catch (error) {
        logger.error('Failed to fetch PR changes', error);
        throw new Error(`Failed to fetch PR changes: ${error}`);
    }
}
async function extractChangesFromPatch(filename, patch) {
    const changes = [];
    if (!patch) {
        return changes;
    }
    const lines = patch.split('\n');
    let currentLine = 0;
    for (const line of lines) {
        if (line.startsWith('@@')) {
            const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
            if (match && match[1]) {
                currentLine = parseInt(match[1]) - 1;
            }
            continue;
        }
        if (line.startsWith('diff ') || line.startsWith('index ') || line.startsWith('+++') || line.startsWith('---')) {
            continue;
        }
        currentLine++;
        if (line.startsWith('+') && !line.startsWith('+++')) {
            const content = line.substring(1);
            changes.push({
                file: filename,
                line: content,
                lineNumber: currentLine,
                type: 'ADDED',
            });
        }
        if (line.startsWith(' ')) {
        }
    }
    return changes;
}
async function postResultsToGitHub(githubToken, prNumber, result) {
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
    }
    catch (error) {
        logger.error('Failed to post results to GitHub', error);
    }
}
function generateGitHubComment(result) {
    const { decision, summary, risksFound, aiAnalyses, processingTime } = result;
    let comment = `## 🔍 Baseline Compatibility Analysis\n\n`;
    const icon = decision.shouldBlock ? '🚨' : summary.high > 0 ? '⚠️' : summary.medium > 0 ? '🔍' : '✅';
    comment += `${icon} **${decision.message}**\n\n`;
    if (summary.critical + summary.high + summary.medium + summary.low > 0) {
        comment += `### Summary\n`;
        comment += `- 🚨 Critical: ${summary.critical}\n`;
        comment += `- ⚠️ High: ${summary.high}\n`;
        comment += `- 🔍 Medium: ${summary.medium}\n`;
        comment += `- 📝 Low: ${summary.low}\n\n`;
    }
    if (aiAnalyses && aiAnalyses.length > 0) {
        comment += `### 🤖 AI-Powered Solutions\n\n`;
        comment += `*Intelligent suggestions based on compatibility analysis*\n\n`;
        for (const analysis of aiAnalyses.slice(0, 3)) {
            comment += `#### 💡 Solutions for \`${analysis.feature}\`\n`;
            comment += `${analysis.reasoning}\n\n`;
            for (const suggestion of analysis.suggestions.slice(0, 2)) {
                const impactIcon = suggestion.impact === 'high' ? '🔥' : suggestion.impact === 'medium' ? '⚖️' : '🔧';
                const typeIcon = suggestion.type === 'alternative' ? '🔄' :
                    suggestion.type === 'polyfill' ? '🛠️' :
                        suggestion.type === 'workaround' ? '🔧' :
                            suggestion.type === 'migration' ? '⬆️' : '💡';
                comment += `**${typeIcon} ${suggestion.title}** ${impactIcon}\n`;
                comment += `${suggestion.description}\n`;
                if (suggestion.code) {
                    comment += `\`\`\`${getLanguageFromFile(analysis.feature)}\n${suggestion.code}\n\`\`\`\n`;
                }
                if (suggestion.resources && suggestion.resources.length > 0) {
                    comment += `📚 Resources: ${suggestion.resources.slice(0, 2).map((url) => `[link](${url})`).join(', ')}\n`;
                }
                comment += `\n`;
            }
            comment += `*Confidence: ${Math.round(analysis.confidence * 100)}%*\n\n---\n\n`;
        }
    }
    if (risksFound.length > 0) {
        comment += `### Detailed Findings\n\n`;
        for (const risk of risksFound.slice(0, 10)) {
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
    comment += `<sub>⏱️ Analysis completed in ${processingTime}ms | 🤖 Powered by Baseline Analyzer</sub>`;
    return comment;
}
function getLanguageFromFile(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap = {
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
if (import.meta.url === `file://${process.argv[1]}`) {
    run();
}
//# sourceMappingURL=main.js.map