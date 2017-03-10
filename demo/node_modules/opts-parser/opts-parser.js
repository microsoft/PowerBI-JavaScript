var XRegExp = require('syntaxhighlighter-regex').XRegExp;

var BOOLEANS = {'true': true, 'false': false};

function camelize(key)
{
  return key.replace(/-(\w+)/g, function(match, word)
  {
    return word.charAt(0).toUpperCase() + word.substr(1);
  });
}

function process(value)
{
  var result = BOOLEANS[value];
  return result == null ? value : result;
}

module.exports = {
  defaults: function(target, source)
  {
    for(var key in source || {})
      if (!target.hasOwnProperty(key))
        target[key] = target[camelize(key)] = source[key];

    return target;
  },

  parse: function(str)
  {
    var match,
        key,
        result = {},
        arrayRegex = XRegExp("^\\[(?<values>(.*?))\\]$"),
        pos = 0,
        regex = XRegExp(
          "(?<name>[\\w-]+)" +
          "\\s*:\\s*" +
          "(?<value>" +
            "[\\w%#-]+|" +    // word
            "\\[.*?\\]|" +    // [] array
            '".*?"|' +        // "" string
            "'.*?'" +         // '' string
          ")\\s*;?",
          "g"
        )
        ;

    while ((match = XRegExp.exec(str, regex, pos)) != null)
    {
      var value = match.value
        .replace(/^['"]|['"]$/g, '') // strip quotes from end of strings
        ;

      // try to parse array value
      if (value != null && arrayRegex.test(value))
      {
        var m = XRegExp.exec(value, arrayRegex);
        value = m.values.length > 0 ? m.values.split(/\s*,\s*/) : [];
      }

      value = process(value);
      result[match.name] = result[camelize(match.name)] = value;
      pos = match.index + match[0].length;
    }

    return result;
  }
};
