import type { IFeatureDetector } from '../../core/interfaces.js';
import type { CodeChange, DetectedFeature } from '../../core/types.js';
export declare class FeatureDetector implements IFeatureDetector {
    detectFeatures(changes: CodeChange[]): Promise<DetectedFeature[]>;
    extractWebFeature(line: string, filePath: string): DetectedFeature | null;
    private detectCSSFeature;
    private detectJSFeature;
    private detectHTMLFeature;
    private deduplicateFeatures;
    private isCSSFile;
    private isJSFile;
    private isHTMLFile;
}
//# sourceMappingURL=index.d.ts.map