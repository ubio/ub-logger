'use strict';

const { Transform } = require('stream');
const stringify = require('json-stringify-safe');

class StringifyTransform extends Transform {
    constructor(options) {
        super(Object.assign({}, options, { writableObjectMode: true }));
    }

    _transform(chunk, encoding, callback) {
        try {
            callback(null, stringify(chunk) + '\n');
        } catch (e) {
            callback(null, chunk + '\n');
        }
    }
}

module.exports = StringifyTransform;
