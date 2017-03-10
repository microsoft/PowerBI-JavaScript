var chai = require('chai');
var BrushBase = require('./brush-base');
var expect = chai.expect;

class TestBrush extends BrushBase {
  constructor() {
    super();

    this.regexList = [
      { regex: new RegExp(this.getKeywords('foo bar', {css: 'test'})) }
    ];
  }
}

describe('brush-base', function() {
  describe('new brush', function() {
    var brush;

    beforeEach(function() {
      brush = new TestBrush();
    });

    it('has `regexList`', function() {
      expect(brush).to.have.property('regexList');
    });

    it('sets keywords', function() {
      expect(brush.regexList[0].regex.toString()).to.equal('/\\b(?:foo|bar)\\b/');
    });

    it('.getHtml()', function() {
      const html = brush.getHtml('bar foo', { className: 'test_brush' });
      expect(html).to.be.ok;
      expect(html).to.match(/class=".*test_brush.*"/);
    });
  });
});