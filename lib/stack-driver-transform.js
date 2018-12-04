'use strict';

const { Transform } = require('stream');

class StackDriverTransform extends Transform {
    constructor(options = {}) {
        super(Object.assign({}, options, { objectMode: true }));
        this.serviceContext = options.serviceContext;
    }

    _transform(chunk, encoding, callback) {
        chunk.serviceContext = Object.assign({}, this.serviceContext);

        const error = chunk.error;

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

        callback(null, chunk);
    }
}

module.exports = StackDriverTransform;
