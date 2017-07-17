
/**
 * Raises a custom event with event data on the specified HTML element.
 * 
 * @export
 * @param {HTMLElement} element
 * @param {string} eventName
 * @param {*} eventData
 */
export function raiseCustomEvent(element: HTMLElement, eventName: string, eventData: any): void {
  let customEvent;
  if (typeof CustomEvent === 'function') {
    customEvent = new CustomEvent(eventName, {
      detail: eventData,
      bubbles: true,
      cancelable: true
    });
  } else {
    customEvent = document.createEvent('CustomEvent');
    customEvent.initCustomEvent(eventName, true, true, eventData);
  }

  element.dispatchEvent(customEvent);
}

/**
 * Finds the index of the first value in an array that matches the specified predicate.
 * 
 * @export
 * @template T
 * @param {(x: T) => boolean} predicate
 * @param {T[]} xs
 * @returns {number}
 */
export function findIndex<T>(predicate: (x: T) => boolean, xs: T[]): number {
  if (!Array.isArray(xs)) {
    throw new Error(`You attempted to call find with second parameter that was not an array. You passed: ${xs}`);
  }

  let index;
  xs.some((x, i) => {
    if (predicate(x)) {
      index = i;
      return true;
    }
  });

  return index;
}

/**
 * Finds the first value in an array that matches the specified predicate.
 * 
 * @export
 * @template T
 * @param {(x: T) => boolean} predicate
 * @param {T[]} xs
 * @returns {T}
 */
export function find<T>(predicate: (x: T) => boolean, xs: T[]): T {
  const index = findIndex(predicate, xs);
  return xs[index];
}

export function remove<T>(predicate: (x: T) => boolean, xs: T[]): void {
  const index = findIndex(predicate, xs);
  xs.splice(index, 1);
}

// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
// TODO: replace in favor of using polyfill
/**
 * Copies the values of all enumerable properties from one or more source objects to a target object, and returns the target object.
 * 
 * @export
 * @param {any} args
 * @returns
 */
export function assign(...args) {
  var target = args[0];

  'use strict';
  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  var output = Object(target);
  for (var index = 1; index < arguments.length; index++) {
    var source = arguments[index];
    if (source !== undefined && source !== null) {
      for (var nextKey in source) {
        if (source.hasOwnProperty(nextKey)) {
          output[nextKey] = source[nextKey];
        }
      }
    }
  }
  return output;
}

/**
 * Generates a random 7 character string.
 * 
 * @export
 * @returns {string}
 */
export function createRandomString(): string {
  return (Math.random() + 1).toString(36).substring(7);
}

/**
 * Adds a parameter to the given url
 * 
 * @export
 * @param {string} url
 * @param {string} paramName
 * @param {string} value
 * @returns {string}
 */
export function addParamToUrl(url: string, paramName: string, value: string): string {
  let parameterPrefix = url.indexOf('?') > 0 ? '&' : '?';
  url += parameterPrefix + paramName + '=' + value;
  return url;
}
