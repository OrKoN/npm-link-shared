var link = require('../lib/link');
var assert = require('assert');
var fs = require('fs');

describe('npm-link-shared', function() {
  this.timeout(60000);

  function basic_test(use_yarn, done) {
    var base = process.cwd();
    var target = base + '/test/target';

    if (use_yarn) {
      target = target + '_yarn';
      link(base + '/test/shared_modules/', target, {
        'executable': 'yarn',
        'linkOptions': ['--production']
      });
    } else {
      link(base + '/test/shared_modules/', target, {
        'linkOptions': ['--production']
      });
    }

    assert(fs.existsSync(target + '/node_modules/module-a'), 'module-a does not exist');
    assert(fs.existsSync(target + '/node_modules/module-b'), 'module-b does not exist');
    assert(fs.existsSync(target + '/node_modules/module-c'), 'module-c does not exist');
    assert(fs.existsSync(target + '/node_modules/@scope/module-d'), '@scope/module-d does not exist');
    assert(
        fs.existsSync(target + '/node_modules/module-b/node_modules/lodash'),
        'lodash does not exist in module-b'
    );
    assert(
        !fs.existsSync(target + '/node_modules/module-b/node_modules/chai'),
        'chai does exist'
    );
    assert(
        fs.existsSync(target + '/node_modules/module-c/node_modules/lodash'),
        'lodash does not exist in module-c'
    );
    done();
  }

  it('should install dependencies via linking', function(done) {
    basic_test(false, done);
  });

  it('should install dependencies via linking using yarn', function(done) {
    basic_test(true, done);
  });

  it('should install dependencies via linking and respect restrictions on modules', function(done) {
    var base = process.cwd();
    var target = base + '/test/target_single';
    link(base + '/test/shared_modules/', target, {
      'moduleWhiteList': ['module-c'],
      'linkOptions': ['--production']
    });
    assert(!fs.existsSync(base + '/test/target_single/node_modules/module-a'), 'module-a exists but should have been ignored');
    assert(!fs.existsSync(base + '/test/target_single/node_modules/module-b'), 'module-b exists but should have been ignored');
    assert(fs.existsSync(base + '/test/target_single/node_modules/module-c'), 'module-c does not exist');
    done();
  });

  it('should also install local dev dependencies via linking', function(done) {
    var base = process.cwd();
    var target = base + '/test/target_dev_dependency';
    link(base + '/test/shared_modules/', target, {
      'moduleWhiteList': ['module-c', 'module-b'],
      'linkOptions': ['--production'],
      'includeDev': true
    });
    assert(fs.existsSync(base + '/test/target_dev_dependency/node_modules/module-c'), 'module-c does not exist');
    assert(fs.existsSync(base + '/test/target_dev_dependency/node_modules/module-b'), 'module-b (included as a local dev dependency) does not exist');
    
    done();
  });

  it("should also install local peer dependencies via linking", function (done) {
    var base = process.cwd();
    var target = base + '/test/target_peer_dependency';
    link(base + '/test/shared_modules/', target, {
      'moduleWhiteList': ['module-c', 'module-b'],
      'linkOptions': ['--production'],
      'includePeer': true
    });
    assert(fs.existsSync(base + '/test/target_peer_dependency/node_modules/module-c'), 'module-c does not exist');
    assert(fs.existsSync(base + '/test/target_peer_dependency/node_modules/module-b'), 'module-b (included as a local peer dependency) does not exist');
    
    done();
  });

  it('should exit cleanly on missing directories', function(done) {
    var base = process.cwd();
    assert.doesNotThrow(function noDirTestNoThrow() {
      link(base + '/test/flarbatron/', base + '/test/target_single');
      link(base + '/test/shared_modules/', base + '/test/flarbatron');
    });
    done();
  });
});
