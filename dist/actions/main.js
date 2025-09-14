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
    let comment = `## 🔍 Web Platform Compatibility Analysis\n\n`;
    const icon = decision.shouldBlock ? '🚨' : summary.high > 0 ? '⚠️' : summary.medium > 0 ? '🔍' : '✅';
    const statusBadge = decision.shouldBlock ? '![BLOCKED](https://img.shields.io/badge/Status-BLOCKED-red)' :
        summary.high > 0 ? '![WARNING](https://img.shields.io/badge/Status-WARNING-orange)' :
            summary.medium > 0 ? '![REVIEW](https://img.shields.io/badge/Status-REVIEW-yellow)' :
                '![PASSED](https://img.shields.io/badge/Status-PASSED-green)';
    comment += `${statusBadge}\n\n`;
    comment += `${icon} **${decision.message}**\n\n`;
    if (summary.critical + summary.high + summary.medium + summary.low > 0) {
        comment += `### 📊 Compatibility Summary\n\n`;
        comment += `| Risk Level | Count | Description |\n`;
        comment += `|------------|-------|--------------|\n`;
        if (summary.critical > 0)
            comment += `| 🚨 **Critical** | ${summary.critical} | Blocking compatibility issues |\n`;
        if (summary.high > 0)
            comment += `| ⚠️ **High** | ${summary.high} | Significant compatibility concerns |\n`;
        if (summary.medium > 0)
            comment += `| 🔍 **Medium** | ${summary.medium} | Potential compatibility issues |\n`;
        if (summary.low > 0)
            comment += `| 📝 **Low** | ${summary.low} | Minor compatibility notes |\n`;
        comment += `\n`;
    }
    if (aiAnalyses && aiAnalyses.length > 0) {
        comment += `### 🤖 AI-Powered Solutions\n\n`;
        comment += `> 💡 **Intelligent compatibility solutions** powered by Perplexity AI\n\n`;
        for (const analysis of aiAnalyses.slice(0, 3)) {
            comment += `<details>\n`;
            comment += `<summary><strong>💡 Solutions for <code>${analysis.feature}</code></strong> <em>(${Math.round(analysis.confidence * 100)}% confidence)</em></summary>\n\n`;
            comment += `**🔍 Analysis:** ${analysis.reasoning}\n\n`;
            for (const [index, suggestion] of analysis.suggestions.slice(0, 3).entries()) {
                const impactBadge = suggestion.impact === 'high' ? '![High Impact](https://img.shields.io/badge/Impact-High-red)' :
                    suggestion.impact === 'medium' ? '![Medium Impact](https://img.shields.io/badge/Impact-Medium-orange)' :
                        '![Low Impact](https://img.shields.io/badge/Impact-Low-green)';
                const typeBadge = suggestion.type === 'alternative' ? '![Alternative](https://img.shields.io/badge/Type-Alternative-blue)' :
                    suggestion.type === 'polyfill' ? '![Polyfill](https://img.shields.io/badge/Type-Polyfill-purple)' :
                        suggestion.type === 'workaround' ? '![Workaround](https://img.shields.io/badge/Type-Workaround-orange)' :
                            suggestion.type === 'migration' ? '![Migration](https://img.shields.io/badge/Type-Migration-green)' :
                                '![Best Practice](https://img.shields.io/badge/Type-Best_Practice-lightblue)';
                const typeIcon = suggestion.type === 'alternative' ? '🔄' :
                    suggestion.type === 'polyfill' ? '🛠️' :
                        suggestion.type === 'workaround' ? '🔧' :
                            suggestion.type === 'migration' ? '⬆️' : '💡';
                comment += `#### ${index + 1}. ${typeIcon} ${suggestion.title}\n\n`;
                comment += `${typeBadge} ${impactBadge}\n\n`;
                comment += `${suggestion.description}\n\n`;
                if (suggestion.code) {
                    const language = inferLanguageFromCode(suggestion.code, analysis.feature);
                    comment += `**Code Example:**\n`;
                    comment += `\`\`\`${language}\n${suggestion.code.trim()}\n\`\`\`\n\n`;
                }
                if (suggestion.resources && suggestion.resources.length > 0) {
                    comment += `**📚 Resources:**\n`;
                    suggestion.resources.slice(0, 3).forEach((url, idx) => {
                        const linkText = url.includes('developer.mozilla.org') ? 'MDN Docs' :
                            url.includes('caniuse.com') ? 'Can I Use' :
                                url.includes('web.dev') ? 'Web.dev' :
                                    `Resource ${idx + 1}`;
                        comment += `- [${linkText}](${url})\n`;
                    });
                    comment += `\n`;
                }
                if (index < analysis.suggestions.slice(0, 3).length - 1) {
                    comment += `---\n\n`;
                }
            }
            comment += `</details>\n\n`;
        }
    }
    if (risksFound.length > 0) {
        comment += `### 🔍 Detailed Compatibility Issues\n\n`;
        for (const risk of risksFound.slice(0, 8)) {
            const riskIcon = risk.risk === 'CRITICAL' ? '🚨' : risk.risk === 'HIGH' ? '⚠️' : risk.risk === 'MEDIUM' ? '🔍' : '📝';
            const riskBadge = risk.risk === 'CRITICAL' ? '![Critical](https://img.shields.io/badge/Risk-Critical-red)' :
                risk.risk === 'HIGH' ? '![High](https://img.shields.io/badge/Risk-High-orange)' :
                    risk.risk === 'MEDIUM' ? '![Medium](https://img.shields.io/badge/Risk-Medium-yellow)' :
                        '![Low](https://img.shields.io/badge/Risk-Low-green)';
            comment += `<details>\n`;
            comment += `<summary>${riskIcon} <strong><code>${risk.feature.name}</code></strong> in <code>${risk.feature.location.file}</code></summary>\n\n`;
            comment += `${riskBadge}\n\n`;
            comment += `**📝 Issue:** ${risk.reason}\n\n`;
            comment += `**💡 Recommendation:** ${risk.recommendation}\n\n`;
            if (risk.feature.location.snippet) {
                const language = getLanguageFromFile(risk.feature.location.file);
                comment += `**📄 Code Location:**\n`;
                comment += `\`\`\`${language}\n${risk.feature.location.snippet.trim()}\n\`\`\`\n\n`;
            }
            if (risk.baseline && risk.baseline.supportedBrowsers) {
                comment += `**🌐 Browser Support:**\n`;
                const browsers = risk.baseline.supportedBrowsers;
                Object.entries(browsers).forEach(([browser, version]) => {
                    const browserIcon = browser.toLowerCase() === 'chrome' ? '🟢' :
                        browser.toLowerCase() === 'firefox' ? '🟠' :
                            browser.toLowerCase() === 'safari' ? '🔵' :
                                browser.toLowerCase() === 'edge' ? '🟢' : '⚪';
                    comment += `- ${browserIcon} ${browser}: ${version || 'Unknown'}\n`;
                });
                comment += `\n`;
            }
            comment += `</details>\n\n`;
        }
        if (risksFound.length > 8) {
            comment += `<details>\n`;
            comment += `<summary><em>📋 View ${risksFound.length - 8} additional ${risksFound.length - 8 === 1 ? 'issue' : 'issues'}</em></summary>\n\n`;
            comment += `Additional compatibility concerns found but collapsed for readability.\n`;
            comment += `</details>\n\n`;
        }
    }
    comment += `---\n\n`;
    comment += `<div align="center">\n\n`;
    comment += `![Baseline Analyzer](https://img.shields.io/badge/Powered%20by-Baseline%20Analyzer-blue?logo=github)\n`;
    comment += `![AI Powered](https://img.shields.io/badge/AI-Perplexity-purple?logo=openai)\n\n`;
    comment += `⏱️ Analysis completed in **${processingTime}ms** | 📊 [Web Platform Status](https://webstatus.dev/) | 🤖 AI-Enhanced\n\n`;
    comment += `</div>`;
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
function inferLanguageFromCode(code, featureName) {
    const codeContent = code.toLowerCase();
    if (/[@:]/.test(code) || /\{[^}]*\}/g.test(code) || featureName.includes('css') ||
        /\b(display|position|color|background|margin|padding|width|height)\s*:/.test(codeContent)) {
        return 'css';
    }
    if (/<[^>]+>/g.test(code) || featureName.includes('html') || featureName.includes('dialog')) {
        return 'html';
    }
    if (/\b(interface|type|implements|extends)\b/.test(codeContent) ||
        /:\s*(string|number|boolean|object)/.test(codeContent) ||
        /<[A-Z][^>]*>/.test(code)) {
        return 'typescript';
    }
    if (/\b(const|let|var|function|class|async|await|import|export)\b/.test(codeContent) ||
        /=>\s*\{/.test(code) || /\.(then|catch|map|filter|reduce)/.test(codeContent)) {
        return 'javascript';
    }
    if (/^\s*\{.*\}\s*$/s.test(code) && !/\bfunction\b/.test(codeContent)) {
        return 'json';
    }
    if (/^\s*(npm|yarn|git|cd|ls|mkdir)/.test(codeContent)) {
        return 'bash';
    }
    return 'text';
}
if (import.meta.url === `file://${process.argv[1]}`) {
    run();
}
//# sourceMappingURL=main.js.map