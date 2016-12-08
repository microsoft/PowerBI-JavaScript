var RouteRecognizer = require('../../dist/route-recognizer');

var router = new RouteRecognizer();
var i = 1000;

while (i--) {
  router.add([{ path: "/foo/" + i, handler: { handler: i } }]);
}

module.exports = {
  name: 'Recognize',
  fn: function() {
    router.recognize('/foo/1');
  }
};