'use strict';

const StackDriverTransform = require('./lib/stack-driver-transform');
const StringifyTransform = require('./lib/stringify-transform');
const PrettyStringTransform = require('./lib/pretty-string-transform');
const makeLogger = require('./lib/make-logger');

function makePrettyStreams(service, version) {
    const out = new StackDriverTransform({ serviceContext: { service, version } });
    const transform = new PrettyStringTransform({ serviceContext: { service, version } });

    out.pipe(transform).pipe(process.stdout);

    return [
        { severity: 'debug', stream: out },
        { severity: 'info', stream: out },
        { severity: 'info', alias: 'metric', stream: out, additional: { isMetric: true } },
        { severity: 'warning', stream: out },
        { severity: 'error', stream: out },
        { severity: 'alert', stream: out }
    ];
}

function makeProductionStreams(service, version) {
    const out = new StackDriverTransform({ serviceContext: { service, version } });
    const err = new StackDriverTransform({ serviceContext: { service, version } });

    out.pipe(new StringifyTransform()).pipe(process.stdout);
    err.pipe(new StringifyTransform()).pipe(process.stderr);

    return [
        { severity: 'debug', stream: out },
        { severity: 'info', stream: out },
        { severity: 'info', alias: 'metric', stream: out, additional: { isMetric: true } },
        { severity: 'warning', stream: out },
        { severity: 'error', stream: err },
        { severity: 'alert', stream: err }
    ];
}

module.exports = function createLogger({ severity, mode, service, version }) {
    let streams;

    if (mode === 'pretty') {
        streams = makePrettyStreams(service, version);
    } else {
        streams = makeProductionStreams(service, version);
    }

    return makeLogger(streams, severity);
};
