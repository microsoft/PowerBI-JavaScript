import { expect } from 'chai';
import { commonRegExp, XRegExp } from '.';

describe('syntaxhighlighter-regex', function() {
  describe('commonRegExp', () => {
    it('is ok', () => expect(commonRegExp).to.be.ok);
    it('has multiLineCComments', () => expect(commonRegExp).to.have.property('multiLineCComments'));
  });

  describe('XRegExp', () => {
    it('is ok', () => expect(XRegExp).to.be.ok);
  });
});
