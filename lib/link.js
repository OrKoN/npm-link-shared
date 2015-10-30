var chalk = require('chalk');
var exec = require('child_process').execSync;
var fs = require('fs');
var path = require('path');
var S = require('string');

function api(sharedDir, targetDir, moduleList) {
  moduleList = moduleList.map(function(item) {
    return sharedDir + item;
  });

  console.log(chalk.green('Will be installing modules from `') + chalk.cyan(sharedDir) + chalk.green('` to `') + chalk.cyan(targetDir) + chalk.green('`...'));
  console.log(chalk.green('Restricted to the following modules'), moduleList.length === 0 ? 'All' : moduleList);

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

    console.log(chalk.gray('\t\t' + exec('npm link --production', {
      cwd: dir
    }).toString()));

    console.log(chalk.gray('\t\t' + exec('npm link ' + name + ' --production', {
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
        console.log(chalk.gray('\t\t' + exec('npm link ' + name + ' --production', {
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
        if (moduleList.length === 0) {
          return true;
        } else {
          return moduleList.indexOf(item) !== -1;
        }
      })
    .forEach(function (dir) {
      link(dir);
    });
}

module.exports = api;