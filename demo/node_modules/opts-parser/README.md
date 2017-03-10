# opts-parser

[![GratiPay](https://img.shields.io/gratipay/user/alexgorbatchev.svg)](https://gratipay.com/alexgorbatchev/)
[![Build Status](https://travis-ci.org/syntaxhighlighter/opts-parser.svg)](https://travis-ci.org/syntaxhighlighter/opts-parser)
[![Coverage](https://img.shields.io/codecov/c/github/syntaxhighlighter/opts-parser.svg)](https://codecov.io/github/syntaxhighlighter/opts-parser)
![Downloads](https://img.shields.io/npm/dm/opts-parser.svg)
![Version](https://img.shields.io/npm/v/opts-parser.svg)

Parses key/value pairs into hash object. The source format looks like HTML's `style` attribute, see below for more details.

This was an old school way of passing random canfiguration values through `class` attribute into SyntaxHighlighter. Why not use `data-*` attributes? Well, back in 2002 those didn't exist... Yes, this could be modernized a bit, at the same time there are hundreds of thousands active usages now. 

## Important

This module depends on a verion of [XRegExp](https://github.com/slevithan/xregexp) that is bundled in [syntaxhighlighter-regex](https://github.com/syntaxhighlighter/syntaxhighlighter-regex). At the time of writing, the bundled version `3.1.0-dev` is unreleased.

## Installation

```
npm install opts-parser
```

## Usage Example

```
var opts = require('opts-parser');
opts.parse("hello: value; foo-bar: [12, "monkeys"]; value: 'value'");

{
  "hello": "value",
  "foo-bar": [12, "monkeys"],
  "fooBar": [12, "monkeys"],
  "value": "value
}
```

Understands the following formats:

- `name: true|false;`
- `name: word;`
- `name: [word, word];`
- `name: "string";`
- `name: 'string';`

## Testing

    npm test

## License

MIT
