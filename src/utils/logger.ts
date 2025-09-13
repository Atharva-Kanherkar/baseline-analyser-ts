/**
 * Simple logger utility for the analyzer
 * In production, this could be replaced with structured logging
 */
export class Logger {
  private prefix = '[Baseline-Analyzer]';

  info(message: string, data?: any): void {
    console.log(`${this.prefix} [INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  warn(message: string, data?: any): void {
    console.warn(`${this.prefix} [WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  error(message: string, error?: any): void {
    console.error(`${this.prefix} [ERROR] ${message}`, error);
  }

  debug(message: string, data?: any): void {
    if (process.env.DEBUG) {
      console.debug(`${this.prefix} [DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
}

// Export singleton instance
export const logger = new Logger();
