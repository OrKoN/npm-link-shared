var link = require('../lib/link');
var chai = require('chai');
chai.use(require('chai-fs'));
var expect = chai.expect;

describe('npm-link-shared', function() {
  this.timeout(15000);
  it('should install dependencies via linking', function(done) {
    var base = process.cwd();
    link(base + '/test/shared_modules/', base + '/test/target', []);
    expect(base + '/test/target/node_modules/module-a').to.be.a.path('module-a does not exist');
    expect(base + '/test/target/node_modules/module-b').to.be.a.path('module-b does not exist');
    expect(base + '/test/target/node_modules/module-b/node_modules/lodash').to.be.a.path('lodash does not exist');
    expect(base + '/test/target/node_modules/module-b/node_modules/chai').not.to.be.a.path('lodash does not exist');
    done();
  });
});