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
        return pusher([{ error: { stack: 'the error stack' } }])
            .then(results => {
                assert.equal(results.length, 1);
                assert.equal(results[0].message, 'the error stack');
            });
    });

    it('prepends a message to the error stack when both are given', () => {
        return pusher([{ message: 'a message', error: { stack: 'the error stack' } }])
            .then(results => {
                assert.equal(results.length, 1);
                assert.equal(results[0].message, 'a message the error stack');
            });
    });

    it('uses the error name and message when it has no stack', () => {
        return pusher([{ error: { name: 'error name', message: 'error message' } }])
            .then(results => {
                assert.equal(results.length, 1);
                assert.equal(results[0].message, 'error name error message');
            });
    });

    it('prepends a message to the error name and message both are given and the error has no stack', () => {
        return pusher([{ message: 'a message', error: { name: 'error name', message: 'error message' } }])
            .then(results => {
                assert.equal(results.length, 1);
                assert.equal(results[0].message, 'a message error name error message');
            });
    });
});
