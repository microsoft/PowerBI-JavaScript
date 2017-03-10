function isEmpty(str)
{
  return /^\s*$/.test(str);
}

module.exports = {
  unindent: function(code)
  {
    var lines = code.split(/\r?\n/),
        regex = /^\s*/,
        min = 1000,
        line,
        matches,
        i,
        l
        ;

    // go through every line and check for common number of indents
    for (i = 0, l = lines.length; i < l && min > 0; i++)
    {
      line = lines[i];

      if (isEmpty(line))
        continue;

      matches = regex.exec(line);

      // In the event that just one line doesn't have leading white space
      // we can't unindent anything, so bail completely.
      if (matches == null)
        return code;

      min = Math.min(matches[0].length, min);
    }

    // trim minimum common number of white space from the begining of every line
    if (min > 0)
      for (i = 0, l = lines.length; i < l; i++)
        if (!isEmpty(lines[i]))
          lines[i] = lines[i].substr(min);

    return lines.join('\n');
  }
};
