'use strict';

const { Transform } = require('stream');

function processContext({ request, headers, status }) {
    if (request && headers) {
        return {
            method: request.method,
            url: request.url,
            responseStatusCode: status,
            referrer: headers.referer,
            userAgent: headers['user-agent'],
            remoteIp: request.ip,
        };
    }
}

function processUser({ authorized, authorizedModel }) {
    if (!authorized) {
        return null;
    }

    return `${authorizedModel}:${authorized.id}${authorized.name ? ` (${authorized.name})` : ''}`;
}

class StackDriverTransform extends Transform {
    constructor(options = {}) {
        super(Object.assign({}, options, { objectMode: true }));
        this.serviceContext = options.serviceContext;
    }

    _transform(chunk, encoding, callback) {
        chunk.serviceContext = Object.assign({}, this.serviceContext);

        const { error, ctx } = chunk.context || {};

        if (error) {
            if (chunk.message) {
                chunk.message = chunk.message + ' ';
            } else {
                chunk.message = '';
            }
            chunk.message += error.stack || `${error.name} ${error.message}`;
        } else if (!chunk.message) {
            chunk.message = 'No message for this log.';
        }

        if (ctx) {
            chunk.context.user = processUser(ctx);
            chunk.context.httpRequest = processContext(ctx);
            delete chunk.context.ctx;
        }

        callback(null, chunk);
    }
}

module.exports = StackDriverTransform;
