var link = require('../lib/link');
var assert = require('assert');
var fs = require('fs');

describe('npm-link-shared', function() {
  this.timeout(15000);
  it('should install dependencies via linking', function(done) {
    var base = process.cwd();
    link(base + '/test/shared_modules/', base + '/test/target', []);
    assert(fs.existsSync(base + '/test/target/node_modules/module-a'), 'module-a does not exist');
    assert(fs.existsSync(base + '/test/target/node_modules/module-b'), 'module-b does not exist');
    assert(fs.existsSync(base + '/test/target/node_modules/module-b/node_modules/lodash'), 'lodash does not exist');
    assert(!fs.existsSync(base + '/test/target/node_modules/module-b/node_modules/chai'), 'lodash does not exist');
    done();
  });
});