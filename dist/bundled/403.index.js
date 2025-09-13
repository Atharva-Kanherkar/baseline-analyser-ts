export const id = 403;
export const ids = [403];
export const modules = {

/***/ 4403:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BaselineService: () => (/* binding */ BaselineService)
/* harmony export */ });
/* harmony import */ var _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5672);

class BaselineService {
    baselineCache = new Map();
    async getBaselineInfo(featureName) {
        if (this.baselineCache.has(featureName)) {
            return this.baselineCache.get(featureName) || null;
        }
        _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.debug(`Looking up baseline info for: ${featureName}`);
        let baselineData = await this.getFromWebFeaturesPackage(featureName);
        if (!baselineData) {
            baselineData = this.getFallbackBaselineData(featureName);
        }
        this.baselineCache.set(featureName, baselineData);
        return baselineData;
    }
    async isFeatureSupported(feature, browsers) {
        const baselineInfo = await this.getBaselineInfo(feature);
        if (!baselineInfo) {
            return false;
        }
        for (const browser of browsers) {
            if (!this.isSupportedInBrowser(baselineInfo, browser)) {
                return false;
            }
        }
        return true;
    }
    async getFromWebFeaturesPackage(featureName) {
        try {
            const { features } = await __webpack_require__.e(/* import() */ 197).then(__webpack_require__.bind(__webpack_require__, 3197));
            const possibleIds = this.mapFeatureNameToWebFeatureId(featureName);
            for (const featureId of possibleIds) {
                const feature = features[featureId];
                if (feature && feature.status) {
                    _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.debug(`Found web-features data for: ${featureName} (id: ${featureId})`);
                    return this.convertWebFeatureToBaselineInfo(feature);
                }
            }
            const bcdKey = this.mapFeatureNameToBCDKey(featureName);
            if (bcdKey) {
                try {
                    const computeBaseline = await __webpack_require__.e(/* import() */ 173).then(__webpack_require__.bind(__webpack_require__, 7173));
                    const getStatus = computeBaseline.getStatus;
                    if (getStatus) {
                        const status = getStatus(null, bcdKey);
                        if (status) {
                            _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.debug(`Found compute-baseline data for: ${featureName} (BCD: ${bcdKey})`);
                            return this.convertComputeBaselineToBaselineInfo(status);
                        }
                    }
                }
                catch (error) {
                    _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.debug(`Error using compute-baseline for ${bcdKey}: ${error}`);
                }
            }
            _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.debug(`No web-features data found for: ${featureName}`);
            return null;
        }
        catch (error) {
            _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.warn(`Error accessing web-features package: ${error}`);
            return null;
        }
    }
    mapFeatureNameToWebFeatureId(featureName) {
        const mappings = {
            'display: grid': ['grid'],
            'display: flex': ['flexbox'],
            ':has': ['has'],
            '@container': ['container-queries'],
            'container-type': ['container-queries'],
            'clamp': ['css-math-functions'],
            'min': ['css-math-functions'],
            'max': ['css-math-functions'],
            'aspect-ratio': ['aspect-ratio'],
            'gap': ['gap'],
            'scroll-behavior': ['scroll-behavior'],
            'position: sticky': ['sticky'],
            'backdrop-filter': ['backdrop-filter'],
            'fetch': ['fetch'],
            'async function': ['async-await'],
            'await ': ['async-await'],
            '=>': ['arrow-functions'],
            'IntersectionObserver': ['intersection-observer'],
            'ResizeObserver': ['resize-observer'],
            'Promise.': ['promises'],
            'dialog': ['dialog'],
            'loading="lazy"': ['loading-lazy'],
            'details': ['details'],
            'picture': ['picture'],
        };
        return mappings[featureName] || [featureName.toLowerCase()];
    }
    mapFeatureNameToBCDKey(featureName) {
        const mappings = {
            'display: grid': 'css.properties.display.grid',
            'display: flex': 'css.properties.display.flex',
            'position: sticky': 'css.properties.position.sticky',
            'aspect-ratio': 'css.properties.aspect-ratio',
            'gap': 'css.properties.gap',
            'scroll-behavior': 'css.properties.scroll-behavior',
            'backdrop-filter': 'css.properties.backdrop-filter',
            'container-type': 'css.properties.container-type',
            ':has': 'css.selectors.has',
            ':is': 'css.selectors.is',
            ':where': 'css.selectors.where',
            ':focus-visible': 'css.selectors.focus-visible',
            'clamp': 'css.types.clamp',
            'min': 'css.types.min',
            'max': 'css.types.max',
            'fetch': 'api.fetch',
            'IntersectionObserver': 'api.IntersectionObserver',
            'ResizeObserver': 'api.ResizeObserver',
            'dialog': 'html.elements.dialog',
            'details': 'html.elements.details',
            'picture': 'html.elements.picture',
            'loading="lazy"': 'html.elements.img.loading',
        };
        return mappings[featureName] || null;
    }
    convertWebFeatureToBaselineInfo(webFeature) {
        const status = webFeature.status.baseline;
        let baselineStatus;
        if (status === 'high') {
            baselineStatus = 'high';
        }
        else if (status === 'low') {
            baselineStatus = 'limited';
        }
        else {
            baselineStatus = 'low';
        }
        const supportedBrowsers = [];
        const support = webFeature.status.support || {};
        for (const [browser, version] of Object.entries(support)) {
            if (typeof version === 'string') {
                const browserMap = {
                    'chrome': 'chrome',
                    'chrome_android': 'chrome',
                    'firefox': 'firefox',
                    'firefox_android': 'firefox',
                    'safari': 'safari',
                    'safari_ios': 'safari',
                    'edge': 'edge',
                };
                const mappedBrowser = browserMap[browser];
                if (mappedBrowser) {
                    supportedBrowsers.push({
                        browser: mappedBrowser,
                        version: version,
                    });
                }
            }
        }
        return {
            status: baselineStatus,
            isBaseline2023: Boolean(webFeature.status.baseline_high_date &&
                new Date(webFeature.status.baseline_high_date).getFullYear() <= 2023),
            isWidelySupported: status === 'high',
            supportedBrowsers,
            dateSupported: webFeature.status.baseline_high_date ||
                webFeature.status.baseline_low_date || null,
        };
    }
    convertComputeBaselineToBaselineInfo(computeStatus) {
        const status = computeStatus.baseline;
        let baselineStatus;
        if (status === 'high') {
            baselineStatus = 'high';
        }
        else if (status === 'low') {
            baselineStatus = 'limited';
        }
        else {
            baselineStatus = 'low';
        }
        const supportedBrowsers = [];
        const support = computeStatus.support || {};
        for (const [browser, version] of Object.entries(support)) {
            if (typeof version === 'string') {
                supportedBrowsers.push({
                    browser: browser.toLowerCase(),
                    version: version,
                });
            }
        }
        return {
            status: baselineStatus,
            isBaseline2023: Boolean(computeStatus.baseline_high_date &&
                new Date(computeStatus.baseline_high_date).getFullYear() <= 2023),
            isWidelySupported: status === 'high',
            supportedBrowsers,
            dateSupported: computeStatus.baseline_high_date ||
                computeStatus.baseline_low_date || null,
        };
    }
    getFallbackBaselineData(featureName) {
        const fallbackData = {
            'display: grid': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '57' },
                    { browser: 'firefox', version: '52' },
                    { browser: 'safari', version: '10.1' },
                    { browser: 'edge', version: '16' },
                ],
                dateSupported: '2017-03-01',
            },
            'display: flex': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '29' },
                    { browser: 'firefox', version: '28' },
                    { browser: 'safari', version: '9' },
                    { browser: 'edge', version: '12' },
                ],
                dateSupported: '2014-03-01',
            },
            ':has': {
                status: 'limited',
                isBaseline2023: false,
                isWidelySupported: false,
                supportedBrowsers: [
                    { browser: 'chrome', version: '105' },
                    { browser: 'firefox', version: '103' },
                    { browser: 'safari', version: '15.4' },
                    { browser: 'edge', version: '105' },
                ],
                dateSupported: '2022-08-01',
            },
            '@container': {
                status: 'limited',
                isBaseline2023: false,
                isWidelySupported: false,
                supportedBrowsers: [
                    { browser: 'chrome', version: '105' },
                    { browser: 'firefox', version: '110' },
                    { browser: 'safari', version: '16' },
                    { browser: 'edge', version: '105' },
                ],
                dateSupported: '2023-02-01',
            },
            'clamp': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '79' },
                    { browser: 'firefox', version: '75' },
                    { browser: 'safari', version: '13.1' },
                    { browser: 'edge', version: '79' },
                ],
                dateSupported: '2020-03-01',
            },
            'fetch': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '42' },
                    { browser: 'firefox', version: '39' },
                    { browser: 'safari', version: '10.1' },
                    { browser: 'edge', version: '14' },
                ],
                dateSupported: '2017-03-01',
            },
            'async function': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '55' },
                    { browser: 'firefox', version: '52' },
                    { browser: 'safari', version: '10.1' },
                    { browser: 'edge', version: '15' },
                ],
                dateSupported: '2017-03-01',
            },
            '=>': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '45' },
                    { browser: 'firefox', version: '22' },
                    { browser: 'safari', version: '10' },
                    { browser: 'edge', version: '12' },
                ],
                dateSupported: '2016-10-01',
            },
            'IntersectionObserver': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '51' },
                    { browser: 'firefox', version: '55' },
                    { browser: 'safari', version: '12.1' },
                    { browser: 'edge', version: '15' },
                ],
                dateSupported: '2019-03-01',
            },
            'dialog': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '37' },
                    { browser: 'firefox', version: '98' },
                    { browser: 'safari', version: '15.4' },
                    { browser: 'edge', version: '79' },
                ],
                dateSupported: '2022-03-01',
            },
            'loading="lazy"': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '76' },
                    { browser: 'firefox', version: '75' },
                    { browser: 'safari', version: '15.4' },
                    { browser: 'edge', version: '79' },
                ],
                dateSupported: '2022-03-01',
            },
        };
        const data = fallbackData[featureName];
        if (data) {
            _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.debug(`Found fallback baseline data for: ${featureName}`);
            return data;
        }
        _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.debug(`No baseline data found for: ${featureName}, using conservative estimate`);
        return {
            status: 'unknown',
            isBaseline2023: false,
            isWidelySupported: false,
            supportedBrowsers: [],
            dateSupported: null,
        };
    }
    isSupportedInBrowser(baselineInfo, targetBrowser) {
        const [browser, version] = this.parseBrowserTarget(targetBrowser);
        const supportData = baselineInfo.supportedBrowsers.find(b => b.browser.toLowerCase() === browser.toLowerCase());
        if (!supportData) {
            return false;
        }
        return this.compareVersions(supportData.version, version) <= 0;
    }
    parseBrowserTarget(target) {
        const match = target.match(/(\w+)\s*(?:>=|>)?\s*(\d+(?:\.\d+)?)/);
        if (match && match[1] && match[2]) {
            return [match[1], match[2]];
        }
        return [target, '0'];
    }
    compareVersions(version1, version2) {
        const v1parts = version1.split('.').map(Number);
        const v2parts = version2.split('.').map(Number);
        for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
            const v1part = v1parts[i] || 0;
            const v2part = v2parts[i] || 0;
            if (v1part > v2part)
                return 1;
            if (v1part < v2part)
                return -1;
        }
        return 0;
    }
}
//# sourceMappingURL=baseline.service.js.map

/***/ })

};

//# sourceMappingURL=403.index.js.map