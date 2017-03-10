import Renderer from 'syntaxhighlighter-html-renderer';
import { XRegExp } from 'syntaxhighlighter-regex';
import { applyRegexList } from 'syntaxhighlighter-match';

module.exports = class BrushBase {
  /**
   * Converts space separated list of keywords into a regular expression string.
   * @param {String} str Space separated keywords.
   * @return {String} Returns regular expression string.
   */
  getKeywords(str)
  {
    const results = str
      .replace(/^\s+|\s+$/g, '')
      .replace(/\s+/g, '|')
      ;

    return `\\b(?:${results})\\b`;
  }

  /**
   * Makes a brush compatible with the `html-script` functionality.
   * @param {Object} regexGroup Object containing `left` and `right` regular expressions.
   */
  forHtmlScript(regexGroup)
  {
    const regex = { 'end': regexGroup.right.source };

    if (regexGroup.eof) {
      regex.end = `(?:(?:${regex.end})|$)`;
    }

    this.htmlScript = {
      left: { regex: regexGroup.left, css: 'script' },
      right: { regex: regexGroup.right, css: 'script' },
      code: XRegExp(
        "(?<left>" + regexGroup.left.source + ")" +
        "(?<code>.*?)" +
        "(?<right>" + regex.end + ")",
        "sgi"
        )
    };
  }

  getHtml(code, params = {}) {
    const matches = applyRegexList(code, this.regexList);
    const renderer = new Renderer(code, matches, params);
    return renderer.getHtml();
  }
};
