#!/usr/bin/env node

var chalk = require('chalk');
var exec = require('child_process').execSync;
var fs = require('fs');
var path = require('path');
var S = require('string');
var argv = require('minimist')(process.argv.slice(2));

var usage = 'Usage: npm-link-shared <shared-modules-dir> <target-installation-dir> [<module1..> [, <module2..>]]';

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

var INCLUDED_MODULES = [];
if (argv._.length > 2) {
  for (var i = 2; i < argv._.length; i++) {
    INCLUDED_MODULES.push(sharedDir + argv._[i]);
  }
}

console.log(chalk.green('Will be installing modules from `') + chalk.cyan(sharedDir) + chalk.green('` to `') + chalk.cyan(targetDir) + chalk.green('`...'));
console.log(chalk.green('Restricted to the following modules'), INCLUDED_MODULES);

var DIRS = fs.readdirSync(sharedDir).filter(function (item) {
  return item[0] !== '.';
})
  .map(function (item) {
    return sharedDir + item;
  })
  .filter(function (item) {
    return fs.statSync(item).isDirectory();
  });

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

DIRS
  .filter(function (item) { // install only explicitly set modules
      if (INCLUDED_MODULES.length == 0) {
        return true;
      } else {
        return INCLUDED_MODULES.indexOf(item) !== -1;
      }
    })
  .forEach(function (dir) {
    link(dir);
  });
