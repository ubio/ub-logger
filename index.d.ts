declare function ubioLogger(options: ubioLogger.LoggerOptions): ubioLogger.Logger

declare namespace ubioLogger {
    export interface LoggerOptions {
        severity: string,
        mode?: string,
        service: string,
        version: string
    }

    export interface Logger {
        metric(message: string, details?: object): void;
        debug(message: string, details?: object): void;
        info(message: string, details?: object): void;
        warning(message: string, details?: object): void;
        warn(message: string, details?: object): void;
        error(message: string, details?: object): void;
        alert(message: string, details?: object): void;
    }
}

export = ubioLogger;
