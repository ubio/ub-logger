'use strict';

const stream = require('stream');
const sinon = require('sinon');
const assert = require('assert');
const makeLogger = require('../../lib/make-logger');

class BufferingWritable extends stream.Writable {
    constructor(options) {
        super(Object.assign({}, options, { objectMode: true }));
        this.buffer = [];
    }

    _write(chunk, encoding, callback) {
        this.buffer.push(chunk);
        callback();
    }
}

describe('makeLogger', () => {
    const sandbox = sinon.sandbox.create();

    let streams;

    beforeEach(() => {
        streams = [
            { severity: 'debug', stream: new BufferingWritable() },
            { severity: 'info', stream: new BufferingWritable() },
            { severity: 'error', stream: new BufferingWritable() },
        ];

        sandbox.stub(Date.prototype, 'toISOString').returns('a-time');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('is a function', () => {
        assert.equal(typeof makeLogger, 'function');
    });

    it('throws an error when the severity is not a valid severity or "mute"', () => {
        assert.throws(
            () => makeLogger(streams, 'blah'),
            err => err instanceof Error,
            'An invalid log level was given: blah'
        );

        assert.doesNotThrow(() => makeLogger(streams, 'mute'));
        assert.doesNotThrow(() => makeLogger(streams, 'debug'));
        assert.doesNotThrow(() => makeLogger(streams, 'info'));
        assert.doesNotThrow(() => makeLogger(streams, 'error'));
    });

    it('logs a message and context with ISO eventTime to the designated stream when the severity is enabled', () => {
        const log = makeLogger(streams, 'debug');

        log.debug('Hello, world!', 'context');

        assert.equal(streams[0].stream.buffer.length, 1);
        assert.equal(streams[1].stream.buffer.length, 0);
        assert.equal(streams[2].stream.buffer.length, 0);
        assert.deepEqual(streams[0].stream.buffer, [{
            severity: 'debug',
            message: 'Hello, world!',
            context: 'context',
            eventTime: 'a-time',
        }]);
    });

    it('does not log a message or context to the designated stream when the severity is disabled', () => {
        const log = makeLogger(streams, 'info');

        log.debug('some debug', 'debug context');
        log.info('some info', 'info context');
        log.error('some error', 'error context');

        assert.equal(streams[0].stream.buffer.length, 0);
        assert.equal(streams[1].stream.buffer.length, 1);
        assert.equal(streams[2].stream.buffer.length, 1);

        assert.deepEqual(streams[1].stream.buffer, [{
            severity: 'info',
            message: 'some info',
            context: 'info context',
            eventTime: 'a-time',
        }]);

        assert.deepEqual(streams[2].stream.buffer, [{
            severity: 'error',
            message: 'some error',
            context: 'error context',
            eventTime: 'a-time',
        }]);
    });

    it('logs nothing when muted', () => {
        const log = makeLogger(streams, 'mute');

        log.debug('some debug', 'debug context');
        log.info('some info', 'info context');
        log.error('some error', 'error context');

        assert.equal(streams[0].stream.buffer.length, 0);
        assert.equal(streams[1].stream.buffer.length, 0);
        assert.equal(streams[2].stream.buffer.length, 0);
    });
});
