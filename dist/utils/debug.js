import { logger } from './logger.js';
export function debugGitHubPayload(payload) {
    logger.info('=== GITHUB WEBHOOK PAYLOAD DEBUG ===');
    if (payload && typeof payload === 'object') {
        logger.info('Top-level payload keys:', Object.keys(payload));
        const pr = payload.pull_request;
        if (pr) {
            logger.info('PR object keys:', Object.keys(pr));
            logger.info('PR sample data:', {
                number: pr.number,
                title: pr.title,
                changed_files: pr.changed_files,
                additions: pr.additions,
                deletions: pr.deletions,
                user_login: pr.user?.login,
                base_repo_name: pr.base?.repo?.name,
                base_repo_owner: pr.base?.repo?.owner?.login,
                base_repo_private: pr.base?.repo?.private,
            });
        }
        const action = payload.action;
        const repository = payload.repository;
        logger.info('Webhook metadata:', {
            action,
            repository_name: repository?.name,
            repository_owner: repository?.owner?.login,
        });
    }
    logger.info('=== END GITHUB PAYLOAD DEBUG ===');
}
export async function debugNpmPackages() {
    logger.info('=== NPM PACKAGES DEBUG ===');
    try {
        const webFeaturesModule = await import('web-features');
        const webFeatures = webFeaturesModule.default || webFeaturesModule;
        if (webFeatures && typeof webFeatures === 'object') {
            const { features, groups, browsers } = webFeatures;
            if (features && groups && browsers) {
                logger.info('✅ web-features package available');
                logger.info(`📊 Features count: ${Object.keys(features).length}`);
                logger.info(`📊 Groups count: ${Object.keys(groups).length}`);
                logger.info(`📊 Browsers count: ${Object.keys(browsers).length}`);
                const testFeatures = ['grid', 'flexbox', 'has', 'container-queries', 'fetch'];
                logger.info('🔍 Testing specific features:');
                for (const featureId of testFeatures) {
                    const feature = features[featureId];
                    if (feature) {
                        logger.info(`  ✅ ${featureId}: ${feature.name} - baseline: ${feature.status?.baseline}`);
                        logger.info(`     Support: ${JSON.stringify(feature.status?.support || {})}`);
                    }
                    else {
                        logger.info(`  ❌ ${featureId}: Not found`);
                    }
                }
                logger.info('🔍 Available groups:');
                Object.entries(groups).slice(0, 5).forEach(([id, group]) => {
                    logger.info(`  📁 ${id}: ${group.name}`);
                });
            }
            else {
                logger.warn('❌ web-features: Invalid module structure');
            }
        }
        else {
            logger.warn('❌ web-features: Invalid module export');
        }
    }
    catch (error) {
        logger.warn('❌ web-features package error:', error.message);
    }
    try {
        const computeBaseline = await import('compute-baseline');
        logger.info('✅ compute-baseline package available');
        const getStatus = computeBaseline.getStatus;
        if (getStatus) {
            logger.info('✅ getStatus function available');
            const testBCDKeys = [
                'css.properties.display.grid',
                'css.selectors.has',
                'api.fetch',
                'html.elements.dialog'
            ];
            logger.info('🔍 Testing specific BCD keys:');
            for (const bcdKey of testBCDKeys) {
                try {
                    const status = getStatus(null, bcdKey);
                    if (status) {
                        logger.info(`  ✅ ${bcdKey}: baseline: ${status.baseline}`);
                        logger.info(`     Support: ${JSON.stringify(status.support || {})}`);
                    }
                    else {
                        logger.info(`  ❌ ${bcdKey}: No data returned`);
                    }
                }
                catch (error) {
                    logger.info(`  ❌ ${bcdKey}: Error - ${error.message}`);
                }
            }
        }
        else {
            logger.warn('❌ getStatus function not found in compute-baseline');
        }
    }
    catch (error) {
        logger.warn('❌ compute-baseline package error:', error.message);
    }
    logger.info('=== END NPM DEBUG ===');
}
export async function testBaselineService() {
    logger.info('=== BASELINE SERVICE TEST ===');
    try {
        const { BaselineService } = await import('../services/baseline.service.js');
        const service = new BaselineService();
        const testFeatures = [
            'display: grid',
            ':has',
            'fetch',
            'dialog',
            'clamp',
            'some-unknown-feature'
        ];
        for (const feature of testFeatures) {
            logger.info(`🔍 Testing feature: "${feature}"`);
            const baseline = await service.getBaselineInfo(feature);
            if (baseline) {
                logger.info(`  ✅ Status: ${baseline.status}`);
                logger.info(`  📅 Date: ${baseline.dateSupported}`);
                logger.info(`  🌐 Widely supported: ${baseline.isWidelySupported}`);
                logger.info(`  📱 Browser count: ${baseline.supportedBrowsers.length}`);
            }
            else {
                logger.info(`  ❌ No baseline data found`);
            }
        }
        logger.info('🔍 Testing browser compatibility:');
        const isGridSupported = await service.isFeatureSupported('display: grid', [
            'chrome >= 90',
            'firefox >= 88',
            'safari >= 14'
        ]);
        logger.info(`  CSS Grid supported in modern browsers: ${isGridSupported}`);
        const isHasSupported = await service.isFeatureSupported(':has', [
            'ie >= 11'
        ]);
        logger.info(`  :has() supported in IE11: ${isHasSupported}`);
    }
    catch (error) {
        logger.error('❌ BaselineService test failed:', error);
    }
    logger.info('=== END BASELINE SERVICE TEST ===');
}
async function runDebugTests() {
    logger.info('🚀 Starting debug tests...');
    await debugNpmPackages();
    await testBaselineService();
    logger.info('✅ Debug tests complete!');
}
if (import.meta.url === `file://${process.argv[1]}`) {
    runDebugTests().catch(error => {
        logger.error('Debug tests failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=debug.js.map