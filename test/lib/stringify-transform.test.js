'use strict';

const stream = require('stream');
const assert = require('assert');
const StringifyTransform = require('../../lib/stringify-transform');

describe('StringifyTransform', () => {
    let transform;
    let written;
    let readable;
    let writable;

    beforeEach(() => {
        readable = new stream.Readable({ objectMode: true });

        written = '';

        writable = new stream.Writable({
            write(chunk, encoding, callback) {
                written += chunk;
                callback();
            }
        });

        transform = new StringifyTransform();
    });

    it('extends stream.Transform', () => {
        assert.ok(transform instanceof stream.Transform);
    });

    it('is writable in object mode', () => {
        assert.strictEqual(transform._writableState.objectMode, true);
    });

    it('is readable in normal mode', () => {
        assert.strictEqual(transform._readableState.objectMode, false);
    });

    it('stringifies incoming objects and appends "\\n" to each', done => {
        readable.pipe(transform).pipe(writable);

        writable.once('finish', () => {
            try {
                assert.equal(written, '{"object":0}\n{"object":1}\n{"object":2}\n');
            } catch (e) {
                return done(e);
            }

            done();
        });

        readable.push({ object: 0 });
        readable.push({ object: 1 });
        readable.push({ object: 2 });
        readable.push(null);
    });

    it('safely stringifies circular objects', done => {
        readable.pipe(transform).pipe(writable);

        writable.once('finish', () => {
            try {
                assert.equal(written, '{"c":"[Circular ~]"}\n');
            } catch (e) {
                return done(e);
            }

            done();
        });

        const circular = {};
        circular.c = circular;

        readable.push(circular);
        readable.push(null);
    });
});
