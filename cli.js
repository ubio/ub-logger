#!/usr/bin/env node
'use strict';

const path = require('path');
const readline = require('readline');
const PrettyStringTransform = require('./lib/pretty-string-transform');
const { name: service, version } = require(path.join(process.cwd(), 'package.json'));

const transform = new PrettyStringTransform({ serviceContext: { service, version } });

transform.pipe(process.stdout);

readline.createInterface({ input: process.stdin }).on('line', data => {
    try {
        transform.write(JSON.parse(data));
    } catch (e) {
        process.stdout.write(data + '\n');
    }
});
