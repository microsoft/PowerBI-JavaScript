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

## Build:
```
gulp build
```
Or if using VScode: `Ctrl + Shift + B`

## Test
Run tests with PhantomJS
```
gulp test
```

There are various command line arguments that can be passed to the test command to facilitate debugging:

Run tests with Chrome
```
gulp test --chrome
```

Enable  debug level logging for karma, and remove code coverage
```
gulp test --debug
```

Disable single run to remain open for debugging
```
gulp test --watch
```

These are often combined and typical command for debugging tests is:
```
gulp test --chrome --debug --watch
```

The build and tests use webpack to compile all the source modules into one bundled module that can execute in the browser.

## Running the demo
Navigate to `/demo` directory

Install bower dependencies
```
bower install
```

Run http-server from demo directory:
```
http-server
```

Open the demo folder in the browser: `http://127.0.0.1:8080/`
```
http://127.0.0.1:8080/
```
