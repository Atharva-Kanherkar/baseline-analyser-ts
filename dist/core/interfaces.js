export class BaselineAnalyzerError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = this.constructor.name;
    }
}
export class ConfigurationError extends BaselineAnalyzerError {
    code = 'CONFIGURATION_ERROR';
    statusCode = 400;
}
export class GitHubAPIError extends BaselineAnalyzerError {
    code = 'GITHUB_API_ERROR';
    statusCode = 502;
}
export class FeatureDetectionError extends BaselineAnalyzerError {
    code = 'FEATURE_DETECTION_ERROR';
    statusCode = 500;
}
//# sourceMappingURL=interfaces.js.map