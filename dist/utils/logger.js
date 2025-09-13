export class Logger {
    prefix = '[Baseline-Analyzer]';
    info(message, data) {
        console.log(`${this.prefix} [INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
    warn(message, data) {
        console.warn(`${this.prefix} [WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
    error(message, error) {
        console.error(`${this.prefix} [ERROR] ${message}`, error);
    }
    debug(message, data) {
        if (process.env.DEBUG) {
            console.debug(`${this.prefix} [DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
        }
    }
}
export const logger = new Logger();
//# sourceMappingURL=logger.js.map