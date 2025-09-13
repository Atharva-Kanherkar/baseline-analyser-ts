import type { IBaselineService } from '../core/interfaces.js';
import type { BaselineInfo } from '../core/types.js';
export declare class BaselineService implements IBaselineService {
    private baselineCache;
    getBaselineInfo(featureName: string): Promise<BaselineInfo | null>;
    isFeatureSupported(feature: string, browsers: string[]): Promise<boolean>;
    private getFromWebFeaturesPackage;
    private mapFeatureNameToWebFeatureId;
    private mapFeatureNameToBCDKey;
    private convertWebFeatureToBaselineInfo;
    private convertComputeBaselineToBaselineInfo;
    private getFallbackBaselineData;
    private isSupportedInBrowser;
    private parseBrowserTarget;
    private compareVersions;
}
//# sourceMappingURL=baseline.service.d.ts.map