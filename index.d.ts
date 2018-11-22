declare function ubNodeLogger(options: ubNodeLogger.LoggerOptions): ubNodeLogger.Logger

declare namespace ubNodeLogger {
    export interface LoggerOptions {
        severity: string,
        mode?: string,
        service: string,
        version: string
    }

    export interface Logger {
        debug(message: string, details?: object): void,
        info(message: string, details?: object): void,
        warning(message: string, details?: object): void,
        error(message: string, details?: object): void,
        alert(message: string, details?: object): void
    }
}

export = ubNodeLogger;
