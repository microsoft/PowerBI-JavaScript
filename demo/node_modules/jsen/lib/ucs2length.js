'use strict';

// Reference: https://github.com/bestiejs/punycode.js/blob/master/punycode.js#L101`
// Info: https://mathiasbynens.be/notes/javascript-unicode
function ucs2length(string) {
    var ucs2len = 0,
        counter = 0,
        length = string.length,
        value, extra;

    while (counter < length) {
        ucs2len++;
        value = string.charCodeAt(counter++);

        if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
            // It's a high surrogate, and there is a next character.
            extra = string.charCodeAt(counter++);

            if ((extra & 0xFC00) !== 0xDC00) { /* Low surrogate. */                 // jshint ignore: line
                counter--;
            }
        }
    }

    return ucs2len;
}

module.exports = ucs2length;