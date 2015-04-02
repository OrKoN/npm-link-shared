#!/usr/bin/env node

var chalk = require('chalk');
var exec = require('child_process').execSync;
var fs = require('fs');
var npm = require('npm');
var path = require('path');
var S = require('string');
var argv = require('minimist')(process.argv.slice(2));

var usage = 'Usage: npm-link-shared <shared-modules-dir> <target-installation-dir>';

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

console.log(chalk.green('Will be installing modules from `') + chalk.cyan(sharedDir) + chalk.green('` to `') + chalk.cyan(targetDir) + chalk.green('`...'));

var DIRS = fs.readdirSync(sharedDir).filter(function (item) {
  return item[0] !== '.';
}).map(function (item) {
  return sharedDir + item;
}).filter(function (item) {
  return fs.statSync(item).isDirectory();
});

// exec = function (cmd, opts) {
//   console.log(chalk.green('Running command `%s` with cwd = `%s`'), cmd, opts.cwd);
// };

var LINKED = {};


function linkDir(dir, name) {
  console.log(chalk.green('\n\nLinking '  + dir));

  console.log(chalk.gray('\t\t' + exec('npm link', {
    cwd: dir
  }).toString()));

  console.log(chalk.gray('\t\t' + exec('npm link ' + name, {
    cwd: targetDir
  }).toString()));

  LINKED[dir] = true;
}

function link(dir) {
  var i = 0;
  var pkg;

  try {
    pkg = JSON.parse(fs.readFileSync(dir + '/package.json', 'utf-8'));
  } catch (err) {
    console.log(chalk.red('`') + chalk.cyan(dir) + chalk.red('` ignored due to missing or erroneous package.json'));
    return;
  }

  var dependencies = pkg.dependencies || {};
  dependencies = Object.keys(dependencies);
  var shared_dependencies = dependencies.filter(function (item) {
    return DIRS.indexOf(sharedDir + item) !== -1;
  }).map(function (item) {
    return sharedDir + item;
  });
  if (shared_dependencies.length > 0) {
    console.log(chalk.green(dir + ' has shared dependencies '), shared_dependencies);
    for (i = 0; i < shared_dependencies.length; i++) {
      if (!LINKED[shared_dependencies[i]]) {
        link(shared_dependencies[i]);
      }
    }
    for (i = 0; i < shared_dependencies.length; i++) {
      var pkgDep = JSON.parse(fs.readFileSync(shared_dependencies[i] + '/package.json', 'utf-8'));
      var name = pkgDep.name;
      console.log(chalk.gray('\t\t' + exec('npm link ' + name, {
        cwd: dir
      }).toString()));
    }
    linkDir(dir, pkg.name);
  } else {
    linkDir(dir, pkg.name);
  }
}

DIRS.forEach(function (dir) {
  link(dir);
});