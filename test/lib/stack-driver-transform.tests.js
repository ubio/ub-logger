'use strict';

const stream = require('stream');
const assert = require('assert');
const StackDriverTransform = require('../../lib/stack-driver-transform');

function pusher(logObjects) {
    const written = [];
    const readable = new stream.Readable({ objectMode: true });
    const transform = new StackDriverTransform({
        serviceContext: { service: 'the-service', version: 'the-version' }
    });
    const writable = new stream.Writable({
        write(chunk, encoding, callback) {
            written.push(chunk);
            callback();
        },
        objectMode: true
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

describe('stack-driver-transform', () => {
    it('extends stream.Transform', () => {
        const transform = new StackDriverTransform();
        assert.ok(transform instanceof stream.Transform);
    });

    it('is writable in object mode', () => {
        const transform = new StackDriverTransform();
        assert.strictEqual(transform._writableState.objectMode, true);
    });

    it('is readable in object mode', () => {
        const transform = new StackDriverTransform();
        assert.strictEqual(transform._readableState.objectMode, true);
    });

    it('appends its service context to chunks and a default message when none is given', () => {
        return pusher([{}])
            .then(results => {
                assert.equal(results.length, 1);
                assert.deepEqual(results[0].serviceContext, { service: 'the-service', version: 'the-version' });
            });
    });

    it('appends a default message when none is given', () => {
        return pusher([{}])
            .then(results => {
                assert.equal(results.length, 1);
                assert.equal(results[0].message, 'No message for this log.');
            });
    });

    it('uses a message when one is given', () => {
        return pusher([{ message: 'a message' }])
            .then(results => {
                assert.equal(results.length, 1);
                assert.equal(results[0].message, 'a message');
            });
    });

    it('uses the error stack to make a message when an error is given', () => {
        return pusher([{ context: { error: { stack: 'the error stack' } } }])
            .then(results => {
                assert.equal(results.length, 1);
                assert.equal(results[0].message, 'the error stack');
            });
    });

    it('prepends a message to the error stack when both are given', () => {
        return pusher([{ message: 'a message', context: { error: { stack: 'the error stack' } } }])
            .then(results => {
                assert.equal(results.length, 1);
                assert.equal(results[0].message, 'a message the error stack');
            });
    });

    it('uses the error name and message when it has no stack', () => {
        return pusher([{ context: { error: { name: 'error name', message: 'error message' } } }])
            .then(results => {
                assert.equal(results.length, 1);
                assert.equal(results[0].message, 'error name error message');
            });
    });

    it('prepends a message to the error name and message both are given and the error has no stack', () => {
        return pusher([{ message: 'a message', context: { error: { name: 'error name', message: 'error message' } } }])
            .then(results => {
                assert.equal(results.length, 1);
                assert.equal(results[0].message, 'a message error name error message');
            });
    });

    it('removes the koa context when found', () => {
        return pusher([{ context: { ctx: {} } }])
            .then(results => {
                assert.equal(results.length, 1);
                assert.strictEqual(results[0].context.ctx, undefined);
            });
    });

    describe('user', () => {
        it('does not append a user when no koa context is found', () => {
            return pusher([{ context: {} }])
                .then(results => {
                    assert.equal(results.length, 1);
                    assert.strictEqual(results[0].context.user, undefined);
                });
        });

        it('sets the user to null when not authorized', () => {
            return pusher([{ context: { ctx: {} } }])
                .then(results => {
                    assert.equal(results.length, 1);
                    assert.strictEqual(results[0].context.user, null);
                });
        });

        it('distils and appends a user from the koa context when possible', () => {
            return pusher([{ context: { ctx: { authorized: { id: 'auth-id' }, authorizedModel: 'auth-model' } } }])
                .then(results => {
                    assert.equal(results.length, 1);
                    assert.equal(results[0].context.user, 'auth-model:auth-id');
                });
        });

        it('adds the auth name when possible', () => {
            return pusher([{ context: { ctx: { authorized: { id: 'auth-id', name: 'auth-name' }, authorizedModel: 'auth-model' } } }])
                .then(results => {
                    assert.equal(results.length, 1);
                    assert.equal(results[0].context.user, 'auth-model:auth-id (auth-name)');
                });
        });
    });

    describe('http requests', () => {
        it('does not append httpRequest when a request or headers from a koa context are missing', () => {
            return pusher([{ context: { ctx: {} } }, { context: { ctx: { request: {} } } }])
                .then(results => {
                    assert.equal(results.length, 2);
                    assert.strictEqual(results[0].context.httpRequest, undefined);
                    assert.strictEqual(results[1].context.httpRequest, undefined);
                });
        });

        it('adds selected information about a request', () => {
            const logObjects = [{
                context: {
                    ctx: {
                        status: 'the-status',
                        headers: {
                            'user-agent': 'the-user-agent',
                            referer: 'the-referrer'
                        },
                        request: {
                            method: 'the-method',
                            url: 'the-url',
                            ip: 'the-ip'
                        }
                    }
                }
            }];

            return pusher(logObjects)
                .then(results => {
                    assert.equal(results.length, 1);
                    assert.deepEqual(results[0].httpRequest, {
                        requestMethod: 'the-method',
                        requestUrl: 'the-url',
                        status: 'the-status',
                        referrer: 'the-referrer',
                        userAgent: 'the-user-agent',
                        remoteIp: 'the-ip'
                    });
                });
        });
    });
});
