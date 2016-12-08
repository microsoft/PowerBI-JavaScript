var RouteRecognizer = require('../../dist/route-recognizer');

module.exports = {
  name: 'End-to-end',
  fn: function() {
    var router = new RouteRecognizer();
    
    router.map(function(match) {
      var i = 1000;
      while (i--) {
        match('/posts/' + i).to('showPost' + i);
      }
    });
    
    // Look up time is constant
    router.recognize('/posts/1');
  }
};