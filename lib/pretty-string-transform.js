'use strict';

const { Transform } = require('stream');
const stringify = require('json-stringify-safe');

const grey = text => `\u001b[90m${text}\u001b[39m`;
const green = text => `\u001b[32m${text}\u001b[39m`;
const yellow = text => `\u001b[33m${text}\u001b[39m`;
const red = text => `\u001b[31m${text}\u001b[39m`;
const inverseRed = text => `\u001b[7m\u001b[31m${text}\u001b[39m\u001b[27m`;

const severityToStyle = { debug: grey, info: green, warning: yellow, error: red, alert: inverseRed };

function formatMessage({ severity, message, context = {}, eventTime, service, version }) {
    const style = severityToStyle[severity];

    let str = `[${eventTime}] ${style(severity.toUpperCase())} ${process.pid} ${service}@${version}`;

    if (context.requestId) {
        str += ` (requestId ${context.requestId})`;
    }

    if (message) {
        str += ` ${style(message)}`;
    }

    if (context.user) {
        str += `\nuser: ${context.user}`;
    }

    if (context.httpRequest) {
        str += `\nrequest: ${stringify(context.httpRequest, null, 2)}`;
    }

    return str + '\n';
}

class PrettyStringTransform extends Transform {
    constructor(options = {}) {
        super(Object.assign({}, options, { writableObjectMode: true }));
        this.serviceContext = options.serviceContext;
    }

    _transform(chunk, encoding, callback) {
        try {
            callback(null, formatMessage(Object.assign({}, chunk, this.serviceContext)));
        } catch (e) {
            callback(e);
        }
    }
}

module.exports = PrettyStringTransform;
