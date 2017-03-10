import $ from 'cheerio';
import { expect } from 'chai';
import fs from 'fs';
import { applyRegexList } from 'syntaxhighlighter-match';
import Renderer from '.';

const REGEX_LIST = [
  {regex: /hello|world/g, css: 'greeting'},
  {regex: /\w+/g, css: 'word'}
];

const CODE = fs.readFileSync(`${__dirname}/fixture.js`, 'utf8');

function getHtml(code, opts = {}) {
  const matches = applyRegexList(code, opts.regexList || REGEX_LIST);
  const renderer = new Renderer(code, matches, opts);
  return renderer.getHtml();
}

describe('syntaxhighlighter-html-renderer', function() {
  let element = null;

  function itHasElements({gutter, lineCount, firstLine = 1, highlight = []} = {}) {
    describe('gutter', function() {
      if (gutter) {
        it('is present', () => expect($('td.gutter', element)).to.have.length(1));
        it(`has ${lineCount} lines`, () => expect($('td.gutter > .line', element)).to.have.length(lineCount));
        it(`starts at line ${firstLine}`, () => expect($($('td.gutter > .line', element)[0]).hasClass('number' + firstLine)).to.be.true);

        highlight.forEach(lineNumber =>
          it(`has line ${lineNumber} highlighted`, function() {
            expect($(`td.gutter > .line.number${lineNumber}`, element).hasClass('highlighted')).to.be.true;
          })
        );
      } else {
        it('is not present', () => expect($('td.gutter', element)).to.have.length(0));
      }
    });

    describe('code', function() {
      it('is present', () => expect($('td.code', element)).to.have.length(1));
      it(`has ${lineCount} lines`, () => expect($('td.code > .container > .line', element)).to.have.length(lineCount));
      it(`starts at line ${firstLine}`, () => expect($($('td.code > .container > .line', element)[0]).hasClass('number' + firstLine)).to.be.true);
    });
  };

  describe('rendering with default options', function() {
    before(() => element = $(getHtml(CODE, {})));
    itHasElements({gutter: true, lineCount: 14});
  });

  describe('rendering with options', function() {
    describe('without gutter', function() {
      before(() => element = $(getHtml(CODE, {gutter: false})));
      itHasElements({gutter: false, lineCount: 14});
    });

    describe('custom first line', function() {
      before(() => element = $(getHtml(CODE, {firstLine: 10})));
      itHasElements({gutter: true, lineCount: 14, firstLine: 10});
    });

    describe('line highlighting', function() {
      describe('one line', function() {
        before(() => element = $(getHtml(CODE, {highlight: 1})));
        itHasElements({gutter: true, lineCount: 14, highlight: [1]});
      });

      describe('multiple lines', function() {
        before(() => element = $(getHtml(CODE, {highlight: ['3', '4']})));
        itHasElements({gutter: true, lineCount: 14, highlight: [3, 4]});
      });
    });

    describe('processing URLs', function() {
      before(() => element = $(getHtml(CODE, {autoLinks: true, regexList: []})));
      itHasElements({gutter: true, lineCount: 14});
      it('has URL on line 3', function() {
        expect($("td.code > .container > .line.number3 > .plain > a", element)).to.have.length(1);
      });
    });
  });
});
