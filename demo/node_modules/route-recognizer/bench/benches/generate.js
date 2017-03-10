var RouteRecognizer = require('../../dist/route-recognizer');

var router = new RouteRecognizer();
var i = 1000;

while (i--) {
  router.add([{ path: "/posts/:id", handler: {} }], { as: "post" });
}

module.exports = {
  name: 'Generate',
  fn: function() {
    router.generate("post", { id: 1 });
  }
};