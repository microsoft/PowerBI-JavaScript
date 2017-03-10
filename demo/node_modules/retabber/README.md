# retabber

[![GratiPay](https://img.shields.io/gratipay/user/alexgorbatchev.svg)](https://gratipay.com/alexgorbatchev/)
[![Build Status](https://travis-ci.org/syntaxhighlighter/retabber.svg)](https://travis-ci.org/syntaxhighlighter/retabber)
[![Coverage](https://img.shields.io/codecov/c/github/syntaxhighlighter/retabber.svg)](https://codecov.io/github/syntaxhighlighter/retabber)
![Downloads](https://img.shields.io/npm/dm/retabber.svg)
![Version](https://img.shields.io/npm/v/retabber.svg)

Replaces all tab characters with spaces in a smart way so that columns visually align, similiar to what your regular IDE does.

## Installation

```
npm install retabber
```

## Usage Example

```js
var retabber = require('retabber');
retabber.smart('1\t2\nheh\t2', 4);
1   2
heh 2

retabber.regular('1\t2\nheh\t2', 4);
1    2
heh    2
```

## Testing

```
npm test
```

## License

MIT
