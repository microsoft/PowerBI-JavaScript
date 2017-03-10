var RouteRecognizer = require('../../dist/route-recognizer');

var router = new RouteRecognizer();
var i = 1000;

while (i--) {
  router.add([{ path: "/foo/" + i, handler: { handler: i } }], { as: 'foo'});
}

module.exports = {
  name: 'Handlers For',
  fn: function() {
    router.handlersFor('foo');
  }
};