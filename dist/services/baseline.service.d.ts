import type { IBaselineService } from '../core/interfaces.js';
import type { BaselineInfo } from '../core/types.js';
export declare class BaselineService implements IBaselineService {
    private baselineCache;
    private readonly API_BASE_URL;
    private readonly API_TIMEOUT;
    private getFromBaselineAPI;
    private convertAPIResponseToBaselineInfo;
    getBaselineInfo(featureName: string): Promise<BaselineInfo | null>;
    isFeatureSupported(feature: string, browsers: string[]): Promise<boolean>;
    private mapFeatureNameToWebFeatureId;
    private getFallbackBaselineData;
    private isSupportedInBrowser;
    private parseBrowserTarget;
    private compareVersions;
}
//# sourceMappingURL=baseline.service.d.ts.map