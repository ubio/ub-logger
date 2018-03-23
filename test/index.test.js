'use strict';

const assert = require('assert');
const stream = require('stream');
const SandboxedModule = require('sandboxed-module');
const sinon = require('sinon');

describe('ub-node-logger', () => {
    let stdoutWritten = '';
    let stderrWritten = '';
    let index;

    before(() => {
        index = SandboxedModule.require('../', {
            globals: {
                process: {
                    stdout: new stream.Writable({
                        write(chunk, encoding, callback) {
                            stdoutWritten += chunk;
                            callback();
                        }
                    }),
                    stderr: new stream.Writable({
                        write(chunk, encoding, callback) {
                            stderrWritten += chunk;
                            callback();
                        }
                    })
                },
                Date: class {
                    toISOString() {
                        return 'the-time';
                    }
                }
            }
        });
    });

    beforeEach(() => {
        sinon.stub(Date.prototype, 'getTime').returns('the-time');
    });

    afterEach(() => {
        Date.prototype.getTime.restore();
        stdoutWritten = '';
        stderrWritten = '';
    });

    describe('default mode', () => {
        describe('debug severity', () => {
            let logger;

            before(() => {
                logger = index({ severity: 'debug', service: 'the-service', version: 'the-version' });
            });

            describe('debug', () => {
                beforeEach(() => {
                    logger.debug('this is a debug log');
                });

                it('logs debug logging objects to stdout', () => {
                    assert.deepEqual(JSON.parse(stdoutWritten), {
                        severity: 'debug',
                        message: 'this is a debug log',
                        eventTime: 'the-time',
                        serviceContext: {
                            service: 'the-service',
                            version: 'the-version'
                        }
                    });
                });

                it('separates JSON objects into lines', () => {
                    assert.ok(stdoutWritten.endsWith('\n'));
                });
            });

            describe('info', () => {
                beforeEach(() => {
                    logger.info('this is an info log');
                });

                it('logs info logging objects to stdout', () => {
                    assert.deepEqual(JSON.parse(stdoutWritten), {
                        severity: 'info',
                        message: 'this is an info log',
                        eventTime: 'the-time',
                        serviceContext: {
                            service: 'the-service',
                            version: 'the-version'
                        }
                    });
                });

                it('separates JSON objects into lines', () => {
                    assert.ok(stdoutWritten.endsWith('\n'));
                });
            });

            describe('warning', () => {
                beforeEach(() => {
                    logger.warning('this is a warning log');
                });

                it('logs warning logging objects to stdout', () => {
                    assert.deepEqual(JSON.parse(stdoutWritten), {
                        severity: 'warning',
                        message: 'this is a warning log',
                        eventTime: 'the-time',
                        serviceContext: {
                            service: 'the-service',
                            version: 'the-version'
                        }
                    });
                });

                it('separates JSON objects into lines', () => {
                    assert.ok(stdoutWritten.endsWith('\n'));
                });
            });

            describe('error', () => {
                beforeEach(() => {
                    logger.error('this is an error log');
                });

                it('logs error logging objects to stderr', () => {
                    assert.deepEqual(JSON.parse(stderrWritten), {
                        severity: 'error',
                        message: 'this is an error log',
                        eventTime: 'the-time',
                        serviceContext: {
                            service: 'the-service',
                            version: 'the-version'
                        }
                    });
                });

                it('separates JSON objects into lines', () => {
                    assert.ok(stderrWritten.endsWith('\n'));
                });
            });

            describe('alert', () => {
                beforeEach(() => {
                    logger.alert('this is an alert log');
                });

                it('logs alert logging objects to stderr', () => {
                    assert.deepEqual(JSON.parse(stderrWritten), {
                        severity: 'alert',
                        message: 'this is an alert log',
                        eventTime: 'the-time',
                        serviceContext: {
                            service: 'the-service',
                            version: 'the-version'
                        }
                    });
                });

                it('separates JSON objects into lines', () => {
                    assert.ok(stderrWritten.endsWith('\n'));
                });
            });
        });

        describe('warning severity', () => {
            let logger;

            before(() => {
                logger = index({ severity: 'warning', service: 'the-service', version: 'the-version' });
            });

            describe('debug', () => {
                beforeEach(() => {
                    logger.debug('this is a debug log');
                });

                it('logs nothing', () => {
                    assert.strictEqual(stdoutWritten, '');
                    assert.strictEqual(stderrWritten, '');
                });
            });

            describe('info', () => {
                beforeEach(() => {
                    logger.info('this is an info log');
                });

                it('logs nothing', () => {
                    assert.strictEqual(stdoutWritten, '');
                    assert.strictEqual(stderrWritten, '');
                });
            });

            describe('warning', () => {
                beforeEach(() => {
                    logger.warning('this is a warning log');
                });

                it('logs warning logging objects to stdout', () => {
                    assert.deepEqual(JSON.parse(stdoutWritten), {
                        severity: 'warning',
                        message: 'this is a warning log',
                        eventTime: 'the-time',
                        serviceContext: {
                            service: 'the-service',
                            version: 'the-version'
                        }
                    });
                });

                it('separates JSON objects into lines', () => {
                    assert.ok(stdoutWritten.endsWith('\n'));
                });
            });

            describe('error', () => {
                beforeEach(() => {
                    logger.error('this is an error log');
                });

                it('logs error logging objects to stderr', () => {
                    assert.deepEqual(JSON.parse(stderrWritten), {
                        severity: 'error',
                        message: 'this is an error log',
                        eventTime: 'the-time',
                        serviceContext: {
                            service: 'the-service',
                            version: 'the-version'
                        }
                    });
                });

                it('separates JSON objects into lines', () => {
                    assert.ok(stderrWritten.endsWith('\n'));
                });
            });

            describe('alert', () => {
                beforeEach(() => {
                    logger.alert('this is an alert log');
                });

                it('logs alert logging objects to stderr', () => {
                    assert.deepEqual(JSON.parse(stderrWritten), {
                        severity: 'alert',
                        message: 'this is an alert log',
                        eventTime: 'the-time',
                        serviceContext: {
                            service: 'the-service',
                            version: 'the-version'
                        }
                    });
                });

                it('separates JSON objects into lines', () => {
                    assert.ok(stderrWritten.endsWith('\n'));
                });
            });
        });

        describe('muted', () => {
            let logger;

            before(() => {
                logger = index({ severity: 'mute', service: 'the-service', version: 'the-version' });
            });

            describe('debug', () => {
                beforeEach(() => {
                    logger.debug('this is a debug log');
                });

                it('logs nothing', () => {
                    assert.strictEqual(stdoutWritten, '');
                    assert.strictEqual(stderrWritten, '');
                });
            });

            describe('info', () => {
                beforeEach(() => {
                    logger.info('this is an info log');
                });

                it('logs nothing', () => {
                    assert.strictEqual(stdoutWritten, '');
                    assert.strictEqual(stderrWritten, '');
                });
            });

            describe('warning', () => {
                beforeEach(() => {
                    logger.warning('this is a warning log');
                });

                it('logs nothing', () => {
                    assert.strictEqual(stdoutWritten, '');
                    assert.strictEqual(stderrWritten, '');
                });
            });

            describe('error', () => {
                beforeEach(() => {
                    logger.error('this is an error log');
                });

                it('logs nothing', () => {
                    assert.strictEqual(stdoutWritten, '');
                    assert.strictEqual(stderrWritten, '');
                });
            });

            describe('alert', () => {
                beforeEach(() => {
                    logger.alert('this is an alert log');
                });

                it('logs nothing', () => {
                    assert.strictEqual(stdoutWritten, '');
                    assert.strictEqual(stderrWritten, '');
                });
            });
        });
    });

    describe('pretty mode', () => {
        describe('debug severity', () => {
            let logger;

            before(() => {
                logger = index({ mode: 'pretty', severity: 'debug', service: 'the-service', version: 'the-version' });
            });

            describe('debug', () => {
                beforeEach(() => {
                    logger.debug('this is a debug log');
                });

                it('logs debug messages to stdout', () => {
                    assert.equal(
                        stdoutWritten,
                        '[the-time] \u001b[90mDEBUG\u001b[39m undefined the-service@the-version \u001b[90mthis is a debug log\u001b[39m\n'
                    );
                });
            });

            describe('info', () => {
                beforeEach(() => {
                    logger.info('this is an info log');
                });

                it('logs debug messages to stdout', () => {
                    assert.equal(
                        stdoutWritten,
                        '[the-time] \u001b[32mINFO\u001b[39m undefined the-service@the-version \u001b[32mthis is an info log\u001b[39m\n'
                    );
                });
            });

            describe('warning', () => {
                beforeEach(() => {
                    logger.warning('this is a warning log');
                });

                it('logs warning messages to stdout', () => {
                    assert.equal(
                        stdoutWritten,
                        '[the-time] \u001b[33mWARNING\u001b[39m undefined the-service@the-version \u001b[33mthis is a warning log\u001b[39m\n'
                    );
                });
            });

            describe('error', () => {
                beforeEach(() => {
                    logger.error('this is an error log');
                });

                it('logs debug messages to stdout', () => {
                    assert.equal(
                        stdoutWritten,
                        '[the-time] \u001b[31mERROR\u001b[39m undefined the-service@the-version \u001b[31mthis is an error log\u001b[39m\n'
                    );
                });
            });
        });

        describe('warning severity', () => {
            let logger;

            before(() => {
                logger = index({ mode: 'pretty', severity: 'warning', service: 'the-service', version: 'the-version' });
            });

            describe('debug', () => {
                beforeEach(() => {
                    logger.debug('this is a debug log');
                });

                it('logs nothing', () => {
                    assert.strictEqual(stdoutWritten, '');
                    assert.strictEqual(stderrWritten, '');
                });
            });

            describe('info', () => {
                beforeEach(() => {
                    logger.info('this is an info log');
                });

                it('logs nothing', () => {
                    assert.strictEqual(stdoutWritten, '');
                    assert.strictEqual(stderrWritten, '');
                });
            });

            describe('warning', () => {
                beforeEach(() => {
                    logger.warning('this is a warning log');
                });

                it('logs warning messages to stdout', () => {
                    assert.equal(
                        stdoutWritten,
                        '[the-time] \u001b[33mWARNING\u001b[39m undefined the-service@the-version \u001b[33mthis is a warning log\u001b[39m\n'
                    );
                });
            });

            describe('error', () => {
                beforeEach(() => {
                    logger.error('this is an error log');
                });

                it('logs debug messages to stdout', () => {
                    assert.equal(
                        stdoutWritten,
                        '[the-time] \u001b[31mERROR\u001b[39m undefined the-service@the-version \u001b[31mthis is an error log\u001b[39m\n'
                    );
                });
            });
        });

        describe('muted', () => {
            let logger;

            before(() => {
                logger = index({ mode: 'pretty', severity: 'mute', service: 'the-service', version: 'the-version' });
            });

            describe('debug', () => {
                beforeEach(() => {
                    logger.debug('this is a debug log');
                });

                it('logs nothing', () => {
                    assert.strictEqual(stdoutWritten, '');
                    assert.strictEqual(stderrWritten, '');
                });
            });

            describe('info', () => {
                beforeEach(() => {
                    logger.info('this is an info log');
                });

                it('logs nothing', () => {
                    assert.strictEqual(stdoutWritten, '');
                    assert.strictEqual(stderrWritten, '');
                });
            });

            describe('warning', () => {
                beforeEach(() => {
                    logger.warning('this is a warning log');
                });

                it('logs nothing', () => {
                    assert.strictEqual(stdoutWritten, '');
                    assert.strictEqual(stderrWritten, '');
                });
            });

            describe('error', () => {
                beforeEach(() => {
                    logger.error('this is an error log');
                });

                it('logs nothing', () => {
                    assert.strictEqual(stdoutWritten, '');
                    assert.strictEqual(stderrWritten, '');
                });
            });

            describe('alert', () => {
                beforeEach(() => {
                    logger.alert('this is an alert log');
                });

                it('logs nothing', () => {
                    assert.strictEqual(stdoutWritten, '');
                    assert.strictEqual(stderrWritten, '');
                });
            });
        });
    });
});
