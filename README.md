# npm-link-shared

Installs a set of local node modules into a target folder using `npm link`. Links all dependencies of the local modules if they are listed in the source folder.


## Installation

```
npm install npm-link-shared -g
```

## Usage

```
  npm-link-shared <local-modules-folder> <target-dir>
```

For example:

```
  npm-link-shared /home/user/internal_modules/ /home/user/my-project
```

this links all modules located in the `internal_modules` directory to the `my-project` dir.

## LICENSE

MIT