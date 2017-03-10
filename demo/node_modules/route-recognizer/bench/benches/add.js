var RouteRecognizer = require('../../dist/route-recognizer');

var router = new RouteRecognizer();
function add() {
    var i = 1000;

    while (i--) {
      router.add([{ path: "/foo/" + i, handler: { handler: i } }]);
    }
}

module.exports = {
  name: 'Add',
  fn: function() {
    add();
  }
};