var link = require('../lib/link');
var assert = require('assert');
var fs = require('fs');

describe('scoped-modules', function() {
  this.timeout(30000);
  it('should install dependencies via linking and respect restrictions on modules', function(done) {
    var base = process.cwd();
    link(base + '/test/shared_modules/', base + '/test/target_single', [ '@scope/module-d' ]);
    assert(fs.existsSync(base + '/test/target_single/node_modules/@scope/module-d'), '@scope/module-d does not exist');
    done();
  });
});