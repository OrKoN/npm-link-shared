# npm-link-shared

Installs a set of local node modules into a target folder using `npm link`. Links all dependencies of the local modules if they are listed in the source folder.


## Installation

```
npm install npm-link-shared -g
```

## Changelog

v1.0.6 (2015-04-20) - Removed unneeded npm dependency. Added a possibility to define [which modules to install](#define-specific-modules-to-install).

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

## LICENSE

MIT