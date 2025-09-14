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
    API_BASE_URL = 'https://api.webstatus.dev/v1/features';
    API_TIMEOUT = 10000;
    async getFromBaselineAPI(featureName) {
        try {
            const possibleIds = this.mapFeatureNameToWebFeatureId(featureName);
            for (const featureId of possibleIds) {
                try {
                    const query = encodeURIComponent(`id:${featureId}`);
                    const url = `${this.API_BASE_URL}?q=${query}`;
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);
                    const response = await fetch(url, {
                        signal: controller.signal,
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'baseline-analyzer-ts/1.0.0'
                        }
                    });
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.debug(`API request failed for ${featureId}: ${response.status} ${response.statusText}`);
                        continue;
                    }
                    const result = await response.json();
                    if (result.data && result.data.length > 0) {
                        const feature = result.data[0];
                        if (feature && feature.baseline) {
                            _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.info(`[DATA SOURCE] Using REAL API data for '${featureName}' from Web Platform Status API`);
                            return this.convertAPIResponseToBaselineInfo(feature);
                        }
                        _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.debug(`Feature ${featureId} found but has no baseline data`);
                    }
                    else {
                        _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.debug(`No data found for feature ${featureId}`);
                    }
                }
                catch (error) {
                    if (error instanceof Error && error.name === 'AbortError') {
                        _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.debug(`API request timeout for ${featureId}`);
                    }
                    else {
                        _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.debug(`Error fetching ${featureId} from API: ${error instanceof Error ? error.message : String(error)}`);
                    }
                    continue;
                }
            }
            try {
                const nameQuery = encodeURIComponent(featureName);
                const url = `${this.API_BASE_URL}?q=${nameQuery}`;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT);
                const response = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'baseline-analyzer-ts/1.0.0'
                    }
                });
                clearTimeout(timeoutId);
                if (response.ok) {
                    const result = await response.json();
                    if (result.data && result.data.length > 0) {
                        const bestMatch = result.data.find((feature) => feature.name && feature.name.toLowerCase().includes(featureName.toLowerCase()));
                        if (bestMatch && bestMatch.baseline) {
                            _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.info(`[DATA SOURCE] Using REAL API data for '${featureName}' from Web Platform Status API (name search)`);
                            return this.convertAPIResponseToBaselineInfo(bestMatch);
                        }
                    }
                }
            }
            catch (error) {
                _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.debug(`Error in fallback name search for ${featureName}: ${error instanceof Error ? error.message : String(error)}`);
            }
            return null;
        }
        catch (error) {
            _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.debug(`Error accessing Web Platform Status API: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }
    convertAPIResponseToBaselineInfo(apiFeature) {
        const baseline = apiFeature.baseline;
        if (!baseline) {
            throw new Error('Feature has no baseline data');
        }
        const status = baseline.status;
        let baselineStatus;
        if (status === 'widely') {
            baselineStatus = 'high';
        }
        else if (status === 'newly') {
            baselineStatus = 'limited';
        }
        else {
            baselineStatus = 'low';
        }
        const supportedBrowsers = [];
        if (apiFeature.browser_implementations) {
            for (const [browser, data] of Object.entries(apiFeature.browser_implementations)) {
                if (data && data.version) {
                    supportedBrowsers.push({
                        browser: browser.toLowerCase(),
                        version: data.version,
                    });
                }
            }
        }
        return {
            status: baselineStatus,
            isBaseline2023: Boolean(baseline.high_date &&
                new Date(baseline.high_date).getFullYear() <= 2023),
            isWidelySupported: status === 'widely',
            supportedBrowsers,
            dateSupported: baseline.high_date || baseline.low_date || null,
        };
    }
    async getBaselineInfo(featureName) {
        if (this.baselineCache.has(featureName)) {
            return this.baselineCache.get(featureName) || null;
        }
        _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.debug(`Looking up baseline info for: ${featureName}`);
        let baselineData = await this.getFromBaselineAPI(featureName);
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
    mapFeatureNameToWebFeatureId(featureName) {
        const mappings = {
            'display: grid': ['grid', 'css-grid', 'grid-layout'],
            'grid-template': ['grid', 'css-grid'],
            'grid-template-columns': ['grid', 'css-grid'],
            'display: flex': ['flexbox', 'css-flexbox', 'flexible-box'],
            ':has': ['has', 'css-has', 'has-selector'],
            '@container': ['container-queries', 'css-container-queries', 'cq'],
            'container-type': ['container-queries', 'css-container-queries'],
            'container-name': ['container-queries', 'css-container-queries'],
            'clamp': ['css-math-functions', 'clamp', 'css-clamp'],
            'min': ['css-math-functions', 'css-min'],
            'max': ['css-math-functions', 'css-max'],
            'aspect-ratio': ['aspect-ratio', 'css-aspect-ratio'],
            'gap': ['gap', 'css-gap', 'grid-gap'],
            'scroll-behavior': ['scroll-behavior', 'css-scroll-behavior'],
            'position: sticky': ['sticky', 'css-sticky', 'position-sticky'],
            'backdrop-filter': ['backdrop-filter', 'css-backdrop-filter'],
            'fetch': ['fetch', 'fetch-api'],
            'async function': ['async-await', 'async-functions'],
            'await': ['async-await', 'async-functions'],
            '=>': ['arrow-functions', 'es6-arrow-functions'],
            'IntersectionObserver': ['intersection-observer', 'intersectionobserver-api'],
            'ResizeObserver': ['resize-observer', 'resizeobserver-api'],
            'Promise.': ['promises', 'es6-promises'],
            'structuredClone': ['structured-clone', 'structuredclone'],
            'querySelectorAll': ['queryselector', 'dom-selectors'],
            'addEventListener': ['event-listeners', 'dom-events'],
            'querySelector': ['queryselector', 'dom-selectors'],
            'class': ['es6-classes', 'javascript-classes'],
            'const': ['const', 'es6-const'],
            'dialog': ['dialog', 'html-dialog', 'dialog-element'],
            'loading="lazy"': ['loading-lazy', 'lazy-loading', 'img-loading'],
            'details': ['details', 'html-details', 'details-element'],
            'summary': ['details', 'html-details'],
            'picture': ['picture', 'html-picture', 'picture-element'],
            'source': ['picture', 'html-picture'],
            'aria-': ['aria', 'wai-aria', 'accessibility'],
        };
        const possibleIds = mappings[featureName] || [];
        possibleIds.push(featureName.toLowerCase(), featureName.replace(/[^a-z0-9]/gi, '-').toLowerCase(), featureName.replace(/[^a-z0-9]/gi, '').toLowerCase(), featureName.replace(/:/g, '').trim().toLowerCase(), featureName.replace(/display:\s*/g, '').toLowerCase());
        return [...new Set(possibleIds)];
    }
    getFallbackBaselineData(featureName) {
        _utils_logger_js__WEBPACK_IMPORTED_MODULE_0__/* .logger */ .v.warn(`[DATA SOURCE] Using FALLBACK data for '${featureName}'`);
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
            'grid-template': {
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
            'grid-template-columns': {
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
            'container-name': {
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
            'ResizeObserver': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '64' },
                    { browser: 'firefox', version: '69' },
                    { browser: 'safari', version: '13.1' },
                    { browser: 'edge', version: '79' },
                ],
                dateSupported: '2020-01-01',
            },
            'structuredClone': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '98' },
                    { browser: 'firefox', version: '94' },
                    { browser: 'safari', version: '15.4' },
                    { browser: 'edge', version: '98' },
                ],
                dateSupported: '2022-03-01',
            },
            'querySelectorAll': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '4' },
                    { browser: 'firefox', version: '3.5' },
                    { browser: 'safari', version: '3.2' },
                    { browser: 'edge', version: '12' },
                ],
                dateSupported: '2009-03-01',
            },
            'addEventListener': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '1' },
                    { browser: 'firefox', version: '1' },
                    { browser: 'safari', version: '1' },
                    { browser: 'edge', version: '12' },
                ],
                dateSupported: '2006-01-01',
            },
            'querySelector': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '4' },
                    { browser: 'firefox', version: '3.5' },
                    { browser: 'safari', version: '3.2' },
                    { browser: 'edge', version: '12' },
                ],
                dateSupported: '2009-03-01',
            },
            'class': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '49' },
                    { browser: 'firefox', version: '45' },
                    { browser: 'safari', version: '9' },
                    { browser: 'edge', version: '13' },
                ],
                dateSupported: '2016-04-01',
            },
            'const': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '21' },
                    { browser: 'firefox', version: '36' },
                    { browser: 'safari', version: '5.1' },
                    { browser: 'edge', version: '12' },
                ],
                dateSupported: '2015-03-01',
            },
            'await': {
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
            'details': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '12' },
                    { browser: 'firefox', version: '49' },
                    { browser: 'safari', version: '6' },
                    { browser: 'edge', version: '79' },
                ],
                dateSupported: '2020-01-01',
            },
            'summary': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '12' },
                    { browser: 'firefox', version: '49' },
                    { browser: 'safari', version: '6' },
                    { browser: 'edge', version: '79' },
                ],
                dateSupported: '2020-01-01',
            },
            'picture': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '38' },
                    { browser: 'firefox', version: '38' },
                    { browser: 'safari', version: '9.1' },
                    { browser: 'edge', version: '13' },
                ],
                dateSupported: '2016-04-01',
            },
            'source': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '38' },
                    { browser: 'firefox', version: '38' },
                    { browser: 'safari', version: '9.1' },
                    { browser: 'edge', version: '13' },
                ],
                dateSupported: '2016-04-01',
            },
            'aria-': {
                status: 'high',
                isBaseline2023: true,
                isWidelySupported: true,
                supportedBrowsers: [
                    { browser: 'chrome', version: '4' },
                    { browser: 'firefox', version: '3' },
                    { browser: 'safari', version: '4' },
                    { browser: 'edge', version: '12' },
                ],
                dateSupported: '2010-01-01',
            },
            'max': {
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