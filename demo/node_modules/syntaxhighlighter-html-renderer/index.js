/**
 * Pads number with zeros until it's length is the same as given length.
 *
 * @param {Number} number Number to pad.
 * @param {Number} length Max string length with.
 * @return {String}     Returns a string padded with proper amount of '0'.
 */
function padNumber(number, length)
{
  var result = number.toString();

  while (result.length < length)
    result = '0' + result;

  return result;
};

function getLines(str)
{
  return str.split(/\r?\n/);
}

function getLinesToHighlight(opts)
{
  var results = {},
      linesToHighlight,
      l,
      i
      ;

  linesToHighlight = opts.highlight || [];

  if (typeof(linesToHighlight.push) !== 'function')
    linesToHighlight = [linesToHighlight];

  for (i = 0, l = linesToHighlight.length; i < l; i++)
    results[linesToHighlight[i]] = true;

  return results;
}

export default function Renderer(code, matches, opts)
{
  var _this = this;

  _this.opts = opts;
  _this.code = code;
  _this.matches = matches;
  _this.lines = getLines(code);
  _this.linesToHighlight = getLinesToHighlight(opts);
}

Renderer.prototype = {
  /**
   * Wraps each line of the string into <code/> tag with given style applied to it.
   *
   * @param {String} str   Input string.
   * @param {String} css   Style name to apply to the string.
   * @return {String}      Returns input string with each line surrounded by <span/> tag.
   */
  wrapLinesWithCode: function(str, css)
  {
    if (str == null || str.length == 0 || str == '\n' || css == null)
      return str;

    var _this = this,
        results = [],
        lines,
        line,
        spaces,
        i,
        l
        ;

    str = str.replace(/</g, '&lt;');

    // Replace two or more sequential spaces with &nbsp; leaving last space untouched.
    str = str.replace(/ {2,}/g, function(m)
    {
      spaces = '';

      for (i = 0, l = m.length; i < l - 1; i++)
        spaces += _this.opts.space;

      return spaces + ' ';
    });

    lines = getLines(str);

    // Split each line and apply <span class="...">...</span> to them so that leading spaces aren't included.
    for (i = 0, l = lines.length; i < l; i++)
    {
      line = lines[i];
      spaces = '';

      if (line.length > 0)
      {
        line = line.replace(/^(&nbsp;| )+/, function(s)
        {
          spaces = s;
          return '';
        });

        line = line.length === 0
          ? spaces
          : spaces + '<code class="' + css + '">' + line + '</code>'
          ;
      }

      results.push(line);
    }

    return results.join('\n');
  },

  /**
   * Turns all URLs in the code into <a/> tags.
   * @param {String} code Input code.
   * @return {String} Returns code with </a> tags.
   */
  processUrls: function(code)
  {
    var gt = /(.*)((&gt;|&lt;).*)/,
        url = /\w+:\/\/[\w-.\/?%&=:@;#]*/g
        ;

    return code.replace(url, function(m)
    {
      var suffix = '',
          match = null
          ;

      // We include &lt; and &gt; in the URL for the common cases like <http://google.com>
      // The problem is that they get transformed into &lt;http://google.com&gt;
      // Where as &gt; easily looks like part of the URL string.

      if (match = gt.exec(m))
      {
        m = match[1];
        suffix = match[2];
      }

      return '<a href="' + m + '">' + m + '</a>' + suffix;
    });
  },

  /**
   * Creates an array containing integer line numbers starting from the 'first-line' param.
   * @return {Array} Returns array of integers.
   */
  figureOutLineNumbers: function(code)
  {
    var lineNumbers = [],
        lines = this.lines,
        firstLine = parseInt(this.opts.firstLine || 1),
        i,
        l
        ;

    for (i = 0, l = lines.length; i < l; i++)
      lineNumbers.push(i + firstLine);

    return lineNumbers;
  },

  /**
   * Generates HTML markup for a single line of code while determining alternating line style.
   * @param {Integer} lineNumber  Line number.
   * @param {String} code Line  HTML markup.
   * @return {String}       Returns HTML markup.
   */
  wrapLine: function(lineIndex, lineNumber, lineHtml)
  {
    var classes = [
      'line',
      'number' + lineNumber,
      'index' + lineIndex,
      'alt' + (lineNumber % 2 == 0 ? 1 : 2).toString()
    ];

    if (this.linesToHighlight[lineNumber])
      classes.push('highlighted');

    if (lineNumber == 0)
      classes.push('break');

    return '<div class="' + classes.join(' ') + '">' + lineHtml + '</div>';
  },

  /**
   * Generates HTML markup for line number column.
   * @param {String} code     Complete code HTML markup.
   * @param {Array} lineNumbers Calculated line numbers.
   * @return {String}       Returns HTML markup.
   */
  renderLineNumbers: function(code, lineNumbers)
  {
    var _this = this,
        opts = _this.opts,
        html = '',
        count = _this.lines.length,
        firstLine = parseInt(opts.firstLine || 1),
        pad = opts.padLineNumbers,
        lineNumber,
        i
        ;

    if (pad == true)
      pad = (firstLine + count - 1).toString().length;
    else if (isNaN(pad) == true)
      pad = 0;

    for (i = 0; i < count; i++)
    {
      lineNumber = lineNumbers ? lineNumbers[i] : firstLine + i;
      code = lineNumber == 0 ? opts.space : padNumber(lineNumber, pad);
      html += _this.wrapLine(i, lineNumber, code);
    }

    return html;
  },

  /**
   * Splits block of text into individual DIV lines.
   * @param {String} code     Code to highlight.
   * @param {Array} lineNumbers Calculated line numbers.
   * @return {String}       Returns highlighted code in HTML form.
   */
  getCodeLinesHtml: function(html, lineNumbers)
  {
    // html = utils.trim(html);

    var _this = this,
        opts = _this.opts,
        lines = getLines(html),
        padLength = opts.padLineNumbers,
        firstLine = parseInt(opts.firstLine || 1),
        brushName = opts.brush,
        html = ''
        ;

    for (var i = 0, l = lines.length; i < l; i++)
    {
      var line = lines[i],
          indent = /^(&nbsp;|\s)+/.exec(line),
          spaces = null,
          lineNumber = lineNumbers ? lineNumbers[i] : firstLine + i;
          ;

      if (indent != null)
      {
        spaces = indent[0].toString();
        line = line.substr(spaces.length);
        spaces = spaces.replace(' ', opts.space);
      }

      // line = utils.trim(line);

      if (line.length == 0)
        line = opts.space;

      html += _this.wrapLine(
        i,
        lineNumber,
        (spaces != null ? '<code class="' + brushName + ' spaces">' + spaces + '</code>' : '') + line
      );
    }

    return html;
  },

  /**
   * Returns HTML for the table title or empty string if title is null.
   */
  getTitleHtml: function(title)
  {
    return title ? '<caption>' + title + '</caption>' : '';
  },

  /**
   * Finds all matches in the source code.
   * @param {String} code   Source code to process matches in.
   * @param {Array} matches Discovered regex matches.
   * @return {String} Returns formatted HTML with processed mathes.
   */
  getMatchesHtml: function(code, matches)
  {
    function getBrushNameCss(match)
    {
      var result = match ? (match.brushName || brushName) : brushName;
      return result ? result + ' ' : '';
    };

    var _this = this,
        pos = 0,
        result = '',
        brushName = _this.opts.brush || '',
        match,
        matchBrushName,
        i,
        l
        ;

    // Finally, go through the final list of matches and pull the all
    // together adding everything in between that isn't a match.
    for (i = 0, l = matches.length; i < l; i++)
    {
      match = matches[i];

      if (match === null || match.length === 0)
        continue;

      matchBrushName = getBrushNameCss(match);

      result += _this.wrapLinesWithCode(code.substr(pos, match.index - pos), matchBrushName + 'plain')
          + _this.wrapLinesWithCode(match.value, matchBrushName + match.css)
          ;

      pos = match.index + match.length + (match.offset || 0);
    }

    // don't forget to add whatever's remaining in the string
    result += _this.wrapLinesWithCode(code.substr(pos), getBrushNameCss() + 'plain');

    return result;
  },

  /**
   * Generates HTML markup for the whole syntax highlighter.
   * @param {String} code Source code.
   * @return {String} Returns HTML markup.
   */
  getHtml: function()
  {
    var _this = this,
        opts = _this.opts,
        code = _this.code,
        matches = _this.matches,
        classes = ['syntaxhighlighter'],
        lineNumbers,
        gutter,
        html
        ;

    if (opts.collapse === true)
      classes.push('collapsed');

    gutter = opts.gutter !== false;

    if (!gutter)
      classes.push('nogutter');

    // add custom user style name
    classes.push(opts.className);

    // add brush alias to the class name for custom CSS
    classes.push(opts.brush);

    if (gutter)
      lineNumbers = _this.figureOutLineNumbers(code);

    // processes found matches into the html
    html = _this.getMatchesHtml(code, matches);

    // finally, split all lines so that they wrap well
    html = _this.getCodeLinesHtml(html, lineNumbers);

    // finally, process the links
    if (opts.autoLinks)
      html = _this.processUrls(html);

    html = `
      <div class="${classes.join(' ')}">
        <table border="0" cellpadding="0" cellspacing="0">
          ${_this.getTitleHtml(opts.title)}
          <tbody>
            <tr>
              ${gutter ? `<td class="gutter">${_this.renderLineNumbers(code)}</td>` : ``}
              <td class="code">
                <div class="container">${html}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    return html;
  },
};
