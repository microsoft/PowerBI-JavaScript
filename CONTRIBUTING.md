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

## Known Problems:
Currently the biggest problem is that `.d.ts` file is not automatically generated.
The typescript compiler can output declaration files for each typescript file but does not yet have the capability to output a single declaratione file from multiple modules.

See: https://github.com/Microsoft/TypeScript/issues/4433

The current process is to run tsc with declarations then manually concatenate each file and remove the irrelavant import and export statements.
If this becomes to much of a problem we could move all the source to a single file. 


