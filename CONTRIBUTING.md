# Contributing

## Setup

Clone the repository:
```
git clone https://github.com/Microsoft/PowerBI-JavaScript.git powerbi-client
```

Navigate to the cloned directory

Install local dependencies:
```
npm install
```

## Build:
```
npm run build
```
Or if using VScode: `Ctrl + Shift + B`

## Test
```
npm test
```
By default the tests run using PhantomJS

There are various command line arguments that can be passed to the test command to facilitate debugging:

Run tests with Chrome
```
npm test -- --chrome
```

Enable  debug level logging for karma, and remove code coverage
```
npm test -- --debug
```

Disable single run to remain open for debugging
```
npm test -- --watch
```

These are often combined and typical command for debugging tests is:
```
npm test -- --chrome --debug --watch
```

The build and tests use webpack to compile all the source modules into one bundled module that can execute in the browser.

## Running the demo
Navigate to `/demo` directory

Install bower dependencies:
```
bower install
```

Serve the demo directory:
```
npm start
```

Open the address to view in the browser:
```
http://127.0.0.1:8080/
```
