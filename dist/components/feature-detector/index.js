import { logger } from '../../utils/logger.js';
export class FeatureDetector {
    async detectFeatures(changes) {
        logger.info(`Detecting features from ${changes.length} code changes`);
        const features = [];
        for (const change of changes) {
            const detected = this.extractWebFeature(change.line, change.file);
            if (detected) {
                detected.location.line = change.lineNumber;
                features.push(detected);
            }
        }
        const uniqueFeatures = this.deduplicateFeatures(features);
        logger.info(`Detected ${uniqueFeatures.length} unique web platform features`);
        return uniqueFeatures;
    }
    extractWebFeature(line, filePath) {
        const trimmedLine = line.trim();
        if (this.isCSSFile(filePath)) {
            return this.detectCSSFeature(trimmedLine, filePath);
        }
        if (this.isJSFile(filePath)) {
            return this.detectJSFeature(trimmedLine, filePath);
        }
        if (this.isHTMLFile(filePath)) {
            return this.detectHTMLFeature(trimmedLine, filePath);
        }
        return null;
    }
    detectCSSFeature(line, filePath) {
        const cssProperties = [
            'display: grid',
            'display: flex',
            'display: contents',
            'position: sticky',
            'scroll-behavior',
            'aspect-ratio',
            'gap',
            'grid-template',
            'container-type',
            'container-name',
            '@container',
            'color-scheme',
            'accent-color',
            'backdrop-filter',
            'mask',
            'clip-path',
            'filter',
        ];
        const cssSelectors = [
            ':has(',
            ':is(',
            ':where(',
            ':not(',
            '::backdrop',
            '::marker',
            '::placeholder',
            ':focus-visible',
            ':focus-within',
            ':target-text',
        ];
        const cssFunctions = [
            'clamp(',
            'min(',
            'max(',
            'calc(',
            'var(',
            'env(',
            'color-mix(',
            'color-contrast(',
            'oklch(',
            'oklab(',
        ];
        for (const prop of cssProperties) {
            if (line.includes(prop)) {
                return {
                    name: prop,
                    type: 'CSS',
                    location: {
                        file: filePath,
                        line: 0,
                        snippet: line,
                    },
                };
            }
        }
        for (const selector of cssSelectors) {
            if (line.includes(selector)) {
                return {
                    name: selector.replace('(', ''),
                    type: 'CSS',
                    location: {
                        file: filePath,
                        line: 0,
                        snippet: line,
                    },
                };
            }
        }
        for (const func of cssFunctions) {
            if (line.includes(func)) {
                return {
                    name: func.replace('(', ''),
                    type: 'CSS',
                    location: {
                        file: filePath,
                        line: 0,
                        snippet: line,
                    },
                };
            }
        }
        return null;
    }
    detectJSFeature(line, filePath) {
        const webAPIs = [
            'fetch(',
            'navigator.share(',
            'IntersectionObserver',
            'ResizeObserver',
            'MutationObserver',
            'requestIdleCallback',
            'matchMedia(',
            'getBoundingClientRect',
            'querySelector(',
            'querySelectorAll(',
            'addEventListener(',
            'AbortController',
            'FormData',
            'URLSearchParams',
            'structuredClone',
            'crypto.randomUUID',
            'navigator.clipboard',
            'navigator.geolocation',
            'localStorage',
            'sessionStorage',
            'indexedDB',
            'WebSocket',
            'EventSource',
            'BroadcastChannel',
            'ServiceWorker',
            'PushManager',
            'Notification',
        ];
        const modernSyntax = [
            'async function',
            'async (',
            'await ',
            '=>',
            'const ',
            'let ',
            '`',
            '${',
            '...',
            'class ',
            'extends ',
            'import ',
            'export ',
            'Promise.',
            'Array.from',
            'Array.includes',
            'Object.assign',
            'Object.keys',
            'Object.values',
            'Object.entries',
            'String.includes',
            'String.startsWith',
            'String.endsWith',
            'Number.isNaN',
            'Number.isInteger',
        ];
        for (const api of webAPIs) {
            if (line.includes(api)) {
                return {
                    name: api.replace('(', ''),
                    type: 'WEB_API',
                    location: {
                        file: filePath,
                        line: 0,
                        snippet: line,
                    },
                };
            }
        }
        for (const syntax of modernSyntax) {
            if (line.includes(syntax)) {
                return {
                    name: syntax.trim(),
                    type: 'JAVASCRIPT',
                    location: {
                        file: filePath,
                        line: 0,
                        snippet: line,
                    },
                };
            }
        }
        return null;
    }
    detectHTMLFeature(line, filePath) {
        const htmlElements = [
            '<dialog',
            '<details',
            '<summary',
            '<template',
            '<slot',
            '<picture',
            '<source',
            '<track',
            '<datalist',
            '<output',
            '<progress',
            '<meter',
            '<time',
            '<mark',
            '<wbr',
        ];
        const htmlAttributes = [
            'loading="lazy"',
            'decoding="async"',
            'enterkeyhint=',
            'inputmode=',
            'popover',
            'inert',
            'hidden',
            'contenteditable',
            'draggable',
            'spellcheck',
            'translate',
            'aria-',
            'role=',
            'data-',
        ];
        for (const element of htmlElements) {
            if (line.includes(element)) {
                return {
                    name: element.replace('<', ''),
                    type: 'HTML',
                    location: {
                        file: filePath,
                        line: 0,
                        snippet: line,
                    },
                };
            }
        }
        for (const attr of htmlAttributes) {
            if (line.includes(attr)) {
                return {
                    name: attr,
                    type: 'HTML',
                    location: {
                        file: filePath,
                        line: 0,
                        snippet: line,
                    },
                };
            }
        }
        return null;
    }
    deduplicateFeatures(features) {
        const seen = new Set();
        const unique = [];
        for (const feature of features) {
            const key = `${feature.name}-${feature.type}-${feature.location.file}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(feature);
            }
        }
        return unique;
    }
    isCSSFile(filePath) {
        return /\.(css|scss|sass|less)$/i.test(filePath);
    }
    isJSFile(filePath) {
        return /\.(js|jsx|ts|tsx)$/i.test(filePath);
    }
    isHTMLFile(filePath) {
        return /\.(html|htm)$/i.test(filePath);
    }
}
//# sourceMappingURL=index.js.map