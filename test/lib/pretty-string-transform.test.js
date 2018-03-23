'use strict';

const assert = require('assert');
const stream = require('stream');
const PrettyStringTransform = require('../../lib/pretty-string-transform');

function pusher(logObjects) {
    let written = '';

    const readable = new stream.Readable({ objectMode: true });
    const transform = new PrettyStringTransform({
        serviceContext: { service: 'the-service', version: 'the-version' }
    });
    const writable = new stream.Writable({
        write(chunk, encoding, callback) {
            written += chunk;
            callback();
        }
    });

    return new Promise((resolve, reject) => {
        readable
            .on('error', reject)
            .pipe(transform)
            .on('error', reject)
            .pipe(writable)
            .on('error', reject);

        writable.once('finish', () => resolve(written));

        for (const logObject of logObjects) {
            readable.push(logObject);
        }

        readable.push(null);
    });
}

describe('PrettyStringTransform', () => {
    it('extends stream.Transform', () => {
        const transform = new PrettyStringTransform();
        assert.ok(transform instanceof stream.Transform);
    });

    it('is writable in object mode', () => {
        const transform = new PrettyStringTransform();
        assert.strictEqual(transform._writableState.objectMode, true);
    });

    it('is readable in normal mode', () => {
        const transform = new PrettyStringTransform();
        assert.strictEqual(transform._readableState.objectMode, false);
    });

    describe('debug', () => {
        it('logs a line with general details', () => {
            const logObjects = [{ severity: 'debug', eventTime: 'the-event-time' }];
            const expected = `[the-event-time] \u001b[90mDEBUG\u001b[39m ${process.pid} the-service@the-version\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs a line with a request ID when a request ID is included', () => {
            const logObjects = [
                { severity: 'debug', eventTime: 'the-event-time', context: { requestId: 'the-request-id' } }
            ];
            const expected = `[the-event-time] \u001b[90mDEBUG\u001b[39m ${process.pid} the-service@the-version (requestId the-request-id)\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs a line with a message when a message is included', () => {
            const logObjects = [
                {
                    severity: 'debug',
                    eventTime: 'the-event-time',
                    message: 'first-message'
                },
                {
                    severity: 'debug',
                    eventTime: 'another-event-time',
                    message: 'second-message',
                    context: { requestId: 'the-request-id' }
                }
            ];

            const expected = [
                `[the-event-time] \u001b[90mDEBUG\u001b[39m ${process.pid} the-service@the-version \u001b[90mfirst-message\u001b[39m`,
                `[another-event-time] \u001b[90mDEBUG\u001b[39m ${process.pid} the-service@the-version (requestId the-request-id) \u001b[90msecond-message\u001b[39m`,
                ''
            ].join('\n');

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs a user on the line below when given', () => {
            const logObjects = [
                { severity: 'debug', eventTime: 'the-event-time', context: { user: 'a-user' } }
            ];

            const expected = `[the-event-time] \u001b[90mDEBUG\u001b[39m ${process.pid} the-service@the-version\nuser: a-user\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs the httpRequest object when given', () => {
            const logObjects = [
                {
                    severity: 'debug',
                    eventTime: 'the-event-time',
                    context: { user: 'a-user', httpRequest: { request: true } }
                }
            ];

            const expected = `[the-event-time] \u001b[90mDEBUG\u001b[39m ${process.pid} the-service@the-version\nuser: a-user\nrequest: {\n  "request": true\n}\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });
    });

    describe('info', () => {
        it('logs a line with general details', () => {
            const logObjects = [{ severity: 'info', eventTime: 'the-event-time' }];
            const expected = `[the-event-time] \u001b[32mINFO\u001b[39m ${process.pid} the-service@the-version\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs a line with a request ID when a request ID is included', () => {
            const logObjects = [
                { severity: 'info', eventTime: 'the-event-time', context: { requestId: 'the-request-id' } }
            ];
            const expected = `[the-event-time] \u001b[32mINFO\u001b[39m ${process.pid} the-service@the-version (requestId the-request-id)\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs a line with a message when a message is included', () => {
            const logObjects = [
                {
                    severity: 'info',
                    eventTime: 'the-event-time',
                    message: 'first-message'
                },
                {
                    severity: 'info',
                    eventTime: 'another-event-time',
                    message: 'second-message',
                    context: { requestId: 'the-request-id' }
                }
            ];

            const expected = [
                `[the-event-time] \u001b[32mINFO\u001b[39m ${process.pid} the-service@the-version \u001b[32mfirst-message\u001b[39m`,
                `[another-event-time] \u001b[32mINFO\u001b[39m ${process.pid} the-service@the-version (requestId the-request-id) \u001b[32msecond-message\u001b[39m`,
                ''
            ].join('\n');

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs a user on the line below when given', () => {
            const logObjects = [
                { severity: 'info', eventTime: 'the-event-time', context: { user: 'a-user' } }
            ];

            const expected = `[the-event-time] \u001b[32mINFO\u001b[39m ${process.pid} the-service@the-version\nuser: a-user\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs the httpRequest object when given', () => {
            const logObjects = [
                {
                    severity: 'info',
                    eventTime: 'the-event-time',
                    context: { user: 'a-user', httpRequest: { request: true } }
                }
            ];

            const expected = `[the-event-time] \u001b[32mINFO\u001b[39m ${process.pid} the-service@the-version\nuser: a-user\nrequest: {\n  "request": true\n}\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });
    });

    describe('warning', () => {
        it('logs a line with general details', () => {
            const logObjects = [{ severity: 'warning', eventTime: 'the-event-time' }];
            const expected = `[the-event-time] \u001b[33mWARNING\u001b[39m ${process.pid} the-service@the-version\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs a line with a request ID when a request ID is included', () => {
            const logObjects = [
                { severity: 'warning', eventTime: 'the-event-time', context: { requestId: 'the-request-id' } }
            ];
            const expected = `[the-event-time] \u001b[33mWARNING\u001b[39m ${process.pid} the-service@the-version (requestId the-request-id)\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs a line with a message when a message is included', () => {
            const logObjects = [
                {
                    severity: 'warning',
                    eventTime: 'the-event-time',
                    message: 'first-message'
                },
                {
                    severity: 'warning',
                    eventTime: 'another-event-time',
                    message: 'second-message',
                    context: { requestId: 'the-request-id' }
                }
            ];

            const expected = [
                `[the-event-time] \u001b[33mWARNING\u001b[39m ${process.pid} the-service@the-version \u001b[33mfirst-message\u001b[39m`,
                `[another-event-time] \u001b[33mWARNING\u001b[39m ${process.pid} the-service@the-version (requestId the-request-id) \u001b[33msecond-message\u001b[39m`,
                ''
            ].join('\n');

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs a user on the line below when given', () => {
            const logObjects = [
                { severity: 'warning', eventTime: 'the-event-time', context: { user: 'a-user' } }
            ];

            const expected = `[the-event-time] \u001b[33mWARNING\u001b[39m ${process.pid} the-service@the-version\nuser: a-user\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs the httpRequest object when given', () => {
            const logObjects = [
                {
                    severity: 'warning',
                    eventTime: 'the-event-time',
                    context: { user: 'a-user', httpRequest: { request: true } }
                }
            ];

            const expected = `[the-event-time] \u001b[33mWARNING\u001b[39m ${process.pid} the-service@the-version\nuser: a-user\nrequest: {\n  "request": true\n}\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });
    });

    describe('error', () => {
        it('logs a line with general details', () => {
            const logObjects = [{ severity: 'error', eventTime: 'the-event-time' }];
            const expected = `[the-event-time] \u001b[31mERROR\u001b[39m ${process.pid} the-service@the-version\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs a line with a request ID when a request ID is included', () => {
            const logObjects = [
                { severity: 'error', eventTime: 'the-event-time', context: { requestId: 'the-request-id' } }
            ];
            const expected = `[the-event-time] \u001b[31mERROR\u001b[39m ${process.pid} the-service@the-version (requestId the-request-id)\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs a line with a message when a message is included', () => {
            const logObjects = [
                {
                    severity: 'error',
                    eventTime: 'the-event-time',
                    message: 'first-message'
                },
                {
                    severity: 'error',
                    eventTime: 'another-event-time',
                    message: 'second-message',
                    context: { requestId: 'the-request-id' }
                }
            ];

            const expected = [
                `[the-event-time] \u001b[31mERROR\u001b[39m ${process.pid} the-service@the-version \u001b[31mfirst-message\u001b[39m`,
                `[another-event-time] \u001b[31mERROR\u001b[39m ${process.pid} the-service@the-version (requestId the-request-id) \u001b[31msecond-message\u001b[39m`,
                ''
            ].join('\n');

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs a user on the line below when given', () => {
            const logObjects = [
                { severity: 'error', eventTime: 'the-event-time', context: { user: 'a-user' } }
            ];

            const expected = `[the-event-time] \u001b[31mERROR\u001b[39m ${process.pid} the-service@the-version\nuser: a-user\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs the httpRequest object when given', () => {
            const logObjects = [
                {
                    severity: 'error',
                    eventTime: 'the-event-time',
                    context: { user: 'a-user', httpRequest: { request: true } }
                }
            ];

            const expected = `[the-event-time] \u001b[31mERROR\u001b[39m ${process.pid} the-service@the-version\nuser: a-user\nrequest: {\n  "request": true\n}\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });
    });

    describe('alert', () => {
        it('logs a line with general details', () => {
            const logObjects = [{ severity: 'alert', eventTime: 'the-event-time' }];
            const expected = `[the-event-time] \u001b[7m\u001b[31mALERT\u001b[39m\u001b[27m ${process.pid} the-service@the-version\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs a line with a request ID when a request ID is included', () => {
            const logObjects = [
                { severity: 'alert', eventTime: 'the-event-time', context: { requestId: 'the-request-id' } }
            ];
            const expected = `[the-event-time] \u001b[7m\u001b[31mALERT\u001b[39m\u001b[27m ${process.pid} the-service@the-version (requestId the-request-id)\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs a line with a message when a message is included', () => {
            const logObjects = [
                {
                    severity: 'alert',
                    eventTime: 'the-event-time',
                    message: 'first-message'
                },
                {
                    severity: 'alert',
                    eventTime: 'another-event-time',
                    message: 'second-message',
                    context: { requestId: 'the-request-id' }
                }
            ];

            const expected = [
                `[the-event-time] \u001b[7m\u001b[31mALERT\u001b[39m\u001b[27m ${process.pid} the-service@the-version \u001b[7m\u001b[31mfirst-message\u001b[39m\u001b[27m`,
                `[another-event-time] \u001b[7m\u001b[31mALERT\u001b[39m\u001b[27m ${process.pid} the-service@the-version (requestId the-request-id) \u001b[7m\u001b[31msecond-message\u001b[39m\u001b[27m`,
                ''
            ].join('\n');

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs a user on the line below when given', () => {
            const logObjects = [
                { severity: 'alert', eventTime: 'the-event-time', context: { user: 'a-user' } }
            ];

            const expected = `[the-event-time] \u001b[7m\u001b[31mALERT\u001b[39m\u001b[27m ${process.pid} the-service@the-version\nuser: a-user\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });

        it('logs the httpRequest object when given', () => {
            const logObjects = [
                {
                    severity: 'alert',
                    eventTime: 'the-event-time',
                    context: { user: 'a-user', httpRequest: { request: true } }
                }
            ];

            const expected = `[the-event-time] \u001b[7m\u001b[31mALERT\u001b[39m\u001b[27m ${process.pid} the-service@the-version\nuser: a-user\nrequest: {\n  "request": true\n}\n`;

            return pusher(logObjects).then(logged => assert.equal(logged, expected));
        });
    });
});
