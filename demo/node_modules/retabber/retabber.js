var spaces = '';

// Create a string with 1000 spaces to copy spaces from...
// It's assumed that there would be no indentation longer than that.
for (var i = 0; i < 50; i++)
  spaces += '                    '; // 20 spaces * 50

// This function inserts specified amount of spaces in the string
// where a tab is while removing that given tab.
function insertSpaces(line, pos, count)
{
  return line.substr(0, pos)
    + spaces.substr(0, count)
    + line.substr(pos + 1, line.length) // pos + 1 will get rid of the tab
    ;
}

module.exports = {
  smart: function(code, tabSize)
  {
    var lines = code.split(/\r?\n/),
        tab = '\t',
        line,
        pos,
        i,
        l
        ;

    // Go through all the lines and do the 'smart tabs' magic.
    for (i = 0, l = lines.length; i < l; i++)
    {
      line = lines[i];

      if (line.indexOf(tab) === -1)
        continue;

      pos = 0;

      while ((pos = line.indexOf(tab)) !== -1)
      {
        // This is pretty much all there is to the 'smart tabs' logic.
        // Based on the position within the line and size of a tab,
        // calculate the amount of spaces we need to insert.
        line = insertSpaces(line, pos, tabSize - pos % tabSize);
      }

      lines[i] = line;
    }

    return lines.join('\n');
  },

  regular: function(code, tabSize)
  {
    return code.replace(/\t/g, spaces.substr(0, tabSize));
  }
};
