const chai = require('chai');
const unindenter = require('./unindenter');
const expect = chai.expect;

describe('unindenter', function() {
  describe('.unindent', function() {
    it('removes common number of tabs from each line', function() {
      var actual = unindenter.unindent('\t\t1\n\t\t2');
      expect(actual).to.equal('1\n2');
    });

    it('ignores empty lines', function() {
      var actual = unindenter.unindent('\t\t1\n\n  \n\t\t2\n\t\t\t3');
      expect(actual).to.equal('1\n\n  \n2\n\t3');
    });
  });
});
