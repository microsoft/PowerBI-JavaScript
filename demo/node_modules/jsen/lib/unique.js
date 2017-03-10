'use strict';

var equal = require('./equal.js');

function findIndex(arr, value, comparator) {
    for (var i = 0, len = arr.length; i < len; i++) {
        if (comparator(arr[i], value)) {
            return i;
        }
    }

    return -1;
}

module.exports = function unique(arr) {
    return arr.filter(function uniqueOnly(value, index, self) {
        return findIndex(self, value, equal) === index;
    });
};

module.exports.findIndex = findIndex;