# unindenter

[![GratiPay](https://img.shields.io/gratipay/user/alexgorbatchev.svg)](https://gratipay.com/alexgorbatchev/)
[![Build Status](https://travis-ci.org/syntaxhighlighter/unindenter.svg)](https://travis-ci.org/syntaxhighlighter/unindenter)
[![Coverage](https://img.shields.io/codecov/c/github/syntaxhighlighter/unindenter.svg)](https://codecov.io/github/syntaxhighlighter/unindenter)
![Downloads](https://img.shields.io/npm/dm/unindenter.svg)
![Version](https://img.shields.io/npm/v/unindenter.svg)

Unindents a block of text by the lowest common indent amount. This is useful when you want to remove extra indentantion on a code block.

## Installation

```
npm install unindenter
```

## Usage Example

```js
var unindenter = require('unindenter');
unindenter.unindent('\t\tline 1\n\t\tline 2\n\t\t\tline 3');

line 1
line 2
    line 3
```

## Testing

```
npm test
```

## License

GPL & MIT
