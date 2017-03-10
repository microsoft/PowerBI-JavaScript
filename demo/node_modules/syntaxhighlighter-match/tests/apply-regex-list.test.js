import { expect } from 'chai';
import { applyRegexList } from '..';

const REGEX_LIST = [
  { regex: /hello|world/g, css: 'greeting' },
  { regex: /\w+/g, css: 'word' }
];

describe('apply-regex-list', function() {
  let matches = null;

  describe('.parse', function() {
    before(function() {
      matches = applyRegexList('hello all world', REGEX_LIST);
    });

    describe('matches', function() {
      it('is an array', () => expect(matches).to.be.instanceof(Array));
      it('has items', () => expect(matches).to.have.length.above(0));
    });

    describe('first match', function() {
      it('is `hello`', () => expect(matches[0].value).to.equal('hello'));
      it('is a greeting', () => expect(matches[0].css).to.equal('greeting'));
    });

    describe('second match', function() {
      it('is `all`', () => expect(matches[1].value).to.equal('all'));
      it('is a word', () => expect(matches[1].css).to.equal('word'));
    });

    describe('third match', function() {
      it('is `world`', () => expect(matches[2].value).to.equal('world'));
      it('is a greeting', () => expect(matches[2].css).to.equal('greeting'));
    });
  });
});
