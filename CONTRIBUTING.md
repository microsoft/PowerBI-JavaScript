# Contributing

## Setup

Install Global Depenedencies if needed:
```
npm install -g typings gulp
```

Clone the repository:
```
git clone https://github.com/Microsoft/PowerBI-JavaScript.git powerbi-client
```

Install Dependencies:
```
npm install
typings install
``` 

Build:
```
gulp build
```
Or if using VScode: `Ctrl + Shift + B`

Test
```
// PhantomJS
gulp test
// Chrome (Singel Run: true)
gulp test --debug
// Chrome (Single Run: false)
gulp test --debug --watch
```

The build and tests use webpack to compile all the source modules into one bundled module that can execute in the browser.