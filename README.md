# npm-link-shared

[![Version](https://img.shields.io/npm/v/npm-link-shared.svg)](https://www.npmjs.com/package/npm-link-shared)
[![Build Status](http://img.shields.io/travis/OrKoN/npm-link-shared.svg?style=flat)](https://travis-ci.org/OrKoN/npm-link-shared)
[![Downloads](https://img.shields.io/npm/dm/npm-link-shared.svg)](https://www.npmjs.com/package/npm-link-shared)
[![Dependencies](https://img.shields.io/david/OrKoN/npm-link-shared.svg)](https://github.com/OrKoN/npm-link-shared/blob/master/package.json#L19)

Installs a set of local node modules into a target folder using `npm link`. Links all dependencies of the local modules if they are listed in the source folder.

[Blog post explaining this module](https://60devs.com/simple-way-to-manage-local-node-module-using-npm-link.html).

## Installation

```
npm install npm-link-shared -g
```

## Changelog

v0.3.3 (2016-07-01) - Support for npm link options, removed hardcoded usage of `--production`

v0.3.0 (2016-03-25) - Support for @scope packages. For example, `@scope/my-package`.

v0.2.1 (2016-01-12) - Thanks to @barroudjo, module folder names are now de-coupled from the names in the package.json. So any name can be used as a folder name.

v0.2.0 (2015-10-30) - Links using `--production` flag so that devDependencies should not be installed anymore. Tests added.

v0.1.6 (2015-04-20) - Removed unneeded npm dependency. Added a possibility to define [which modules to install](#define-specific-modules-to-install).

## Usage

```
  npm-link-shared <local-modules-folder> <target-dir>
```

For example:

```
  npm-link-shared /home/user/internal_modules/ /home/user/my-project
```

this links all modules located in the `internal_modules` directory to the `my-project` dir.

### Define specific modules to install

```
npm-link-shared <shared-modules-dir> <target-installation-dir> [<module1..> [, <module2..>]];
```

For example:

```
  npm-link-shared /home/user/internal_modules/ /home/user/my-project my-module1 my-module2
```

this links modules `my-module1` and `my-module2` located in the `internal_modules` directory to the `my-project` dir. Only these two modules are installed but their dependencies are resolved against the entire `internal_modules` directory.

### Define options passed to npm link

```
  npm-link-shared <shared-modules-dir> <target-installation-dir> [--<npm-link-option> [--<npm-link-option>]];
```

For example:

```
  npm-link-shared /home/user/internal_modules/ /home/user/my-project --production
```

this prevents installation of devDependencies of shared modules by passing the production option to npm link (npm link --production)

## LICENSE

MIT
