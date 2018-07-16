declare function ubNodeLogger(options: ubNodeLogger.options): ubNodeLogger.logger

declare namespace ubNodeLogger {
    export interface options {
        severity: string,
        mode?: string,
        service: string,
        version: string
    }

    export interface logger {
        debug(message: string, details?: object): void,
        info(message: string, details?: object): void,
        warning(message: string, details?: object): void,
        error(message: string, details?: object): void,
        alert(message: string, details?: object): void
    }
}

export = ubNodeLogger;
