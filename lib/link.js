var chalk = require('chalk');
var exec = require('child_process').execSync;
var fs = require('fs');
var path = require('path');
var S = require('string');

function api(sharedDir, targetDir, moduleList, optionList) {
  console.log(chalk.green('Will be installing modules from `') +
    chalk.cyan(sharedDir) + chalk.green('` to `') +
    chalk.cyan(targetDir) + chalk.green('`...'));

  if (optionList.length > 0) {
      console.log(chalk.green('Using the following options'), optionList);
  }

  console.log(chalk.green('Restricted to the following modules'),
    moduleList.length === 0 ? 'All' : moduleList);

  var options = optionList.join(' ');

  var sharedDirContent = fs
    .readdirSync(sharedDir);

  var DIRS = sharedDirContent
    .filter(function (item) {
      if (item.startsWith('@')) {
        return false;
      }
      return item[0] !== '.';
    })
    .map(function (item) {
      return sharedDir + item;
    })
    .filter(function (item) {
      return fs.statSync(item).isDirectory();
    });

  var SCOPES = sharedDirContent
    .filter(function (item) {
      if (!item.startsWith('@')) {
        return false;
      }
      return item[0] !== '.';
    })
    .map(function (item) {
      return sharedDir + item;
    })
    .filter(function (item) {
      return fs.statSync(item).isDirectory();
    });

  SCOPES
    .forEach(function (dir) {
      var modules = fs
        .readdirSync(dir)
        .filter(function (item) {
          return item[0] !== '.';
        });
      modules.forEach(function (item) {
        var fullPath = dir + '/' + item;
        if (fs.statSync(fullPath).isDirectory()) {
          DIRS.push(fullPath);
        }
      });
    });

  var MODULES = DIRS
    .map(function (dir) {
      var pkg = readPackageJson(dir) || {};
      return { name: pkg.name, dir: dir };
    })
    .filter(function (pkg) { return pkg.name; });

  var LINKED = {};

  function linkDir(dir, name) {
    console.log(chalk.green('\n\nLinking '  + dir));

    console.log(chalk.gray('\t' + exec('npm link ' + options, {
      cwd: dir
    }).toString()));

    console.log(chalk.gray('\t' + exec('npm link ' + name + ' ' + options, {
      cwd: targetDir
    }).toString()));

    LINKED[dir] = true;
  }

  function readPackageJson(dir) {
    try {
      return pkg = JSON.parse(fs.readFileSync(dir + '/package.json', 'utf-8'));
    } catch (err) {
      console.log(chalk.red('`') + chalk.cyan(dir) + chalk.red('` ignored due to missing or erroneous package.json'));
      return;
    }
  }

  function find(array, criterias) {
    var arrayLength = array.length;
    var i=0;
    var result;
    criteriasKeys = Object.keys(criterias);
    criteriasKeyslength = criteriasKeys.length;

    for (; i<arrayLength; i++) {
      var j=0;
      var criteriasRespected = true;
      var elt = array[i];

      for (; j<criteriasKeyslength; j++) {
        var criteriaKey = criteriasKeys[j];
        if (elt[criteriaKey] !== criterias[criteriaKey]) {
          criteriasRespected = false;
          break;
        }
      }

      if (criteriasRespected) return elt;
    }
  }

  function link(dir) {
    var i = 0;
    var pkg = readPackageJson(dir);

    var dependencies = pkg.dependencies || {};
    dependencies = Object.keys(dependencies);
    var shared_dependencies = dependencies.map(function (dependency) {
      return find(MODULES, {name: dependency});
    }).filter(function (module) {
      return module;
    }).map(function (module) {
      return module.dir;
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
        console.log(chalk.gray('\t' + exec('npm link ' + name + ' --production', {
          cwd: dir
        }).toString()));
      }
      linkDir(dir, pkg.name);
    } else {
      linkDir(dir, pkg.name);
    }
  }

  MODULES
    .filter(function (item) { // install only explicitly set modules
        if (moduleList.length === 0) {
          return true;
        } else {
          return moduleList.indexOf(item.name) !== -1;
        }
      })
    .forEach(function (item) {
      link(item.dir);
    });
}

module.exports = api;
