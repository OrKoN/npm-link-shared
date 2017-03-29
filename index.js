#!/usr/bin/env node

var chalk = require('chalk');
var exec = require('child_process').execSync;
var fs = require('fs');
var path = require('path');
var S = require('string');
var argv = require('minimist')(process.argv.slice(2));
var link = require('./lib/link');

var usage = 'Usage: npm-link-shared <shared-modules-dir> <target-installation-dir> [<module1..> [, <module2..>]] [--yarn] [--include-dev] [--<npm-link-option> [--<npm-link-option>]]';

if (argv._.length < 2) {
  console.log(usage);
  return;
}

var sharedDir = argv._[0];
var targetDir = argv._[1];

if (!sharedDir || !targetDir) {
  console.log(usage);
  return;
}

sharedDir = S(sharedDir).ensureRight('/').s;
targetDir = S(targetDir).ensureRight('/').s;

var moduleWhiteList = [];
if (argv._.length > 2) {
  for (var i = 2; i < argv._.length; i++) {
    moduleWhiteList.push(argv._[i]);
  }
}

var executable = argv['yarn'] ? 'yarn' : 'npm';
var includeDev = argv['include-dev'] ? true : false;

delete(argv['_']);
delete(argv['yarn']);
delete(argv['include-dev']);

var linkOptions = Object.keys(argv).map(function (optionName) {
    return '--' + optionName + '=' + argv[optionName];
});

link(sharedDir, targetDir, {
  'moduleWhiteList': moduleWhiteList,
  'executable': executable,
  'includeDev': includeDev,
  'linkOptions': linkOptions
});
