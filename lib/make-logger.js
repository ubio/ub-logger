'use strict';

function noop() {}

function makeLoggerForSeverity(severity, stream, additional) {
    return function(message, jsonPayload) {
        stream.write({
            ...jsonPayload,
            ...additional,
            severity,
            message,
            eventTime: new Date().toISOString()
        });
    };
}

function makeLogger(streams = [], logSeverity) {
    const logger = Object.create(null);
    const severities = streams.map(({ severity }) => severity);
    const logSeverityIndex = severities.indexOf(logSeverity);

    if (logSeverity !== 'mute' && logSeverityIndex === -1) {
        throw new Error(`An invalid log level was given: ${logSeverity}`);
    }

    for (const { severity, stream, additional, alias } of streams) {
        const inactive = logSeverity === 'mute' || severities.indexOf(severity) < logSeverityIndex;

        logger[alias || severity] = inactive ? noop : makeLoggerForSeverity(severity, stream, additional);
    }

    return logger;
}

module.exports = makeLogger;
