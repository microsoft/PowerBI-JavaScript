import RouteRecognizer from './route-recognizer';

/* global define:true module:true window: true */
if (typeof define === 'function' && define['amd']) {
  define('route-recognizer', function() { return RouteRecognizer; });
} else if (typeof module !== 'undefined' && module['exports']) {
  module['exports'] = RouteRecognizer;
} else if (typeof this !== 'undefined') {
  this['RouteRecognizer'] = RouteRecognizer;
}
