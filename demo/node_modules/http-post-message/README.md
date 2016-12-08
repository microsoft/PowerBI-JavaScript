# htt-post-message
[![Travis branch](https://img.shields.io/travis/Microsoft/http-post-message.svg)](https://travis-ci.org/Microsoft/http-post-message)
[![npm](https://img.shields.io/npm/v/http-post-message.svg)](https://www.npmjs.com/package/http-post-message)
[![Total Downloads](https://img.shields.io/npm/dt/http-post-message.svg)](https://www.npmjs.com/package/http-post-message)
[![Monthly Downloads](https://img.shields.io/npm/dm/http-post-message.svg)](https://www.npmjs.com/package/http-post-message)
[![GitHub tag](https://img.shields.io/github/tag/microsoft/http-post-message.svg)](https://github.com/Microsoft/http-post-message)

A generic messaging component to send HTTP style message payloads over the window.postMessage API. Requires an implementation of window postMessage proxy such as 'window-post-message-proxy'.

## Documentation:
### [https://microsoft.github.io/http-post-message](https://microsoft.github.io/http-post-message)

## Installation

```bash
npm install --save http-post-message
```

## Usage
The HttpPostMessage takes in an object that implements the IPostMessage interface which
is just one method `postMessage` which returns a Promise.

In the case below we created a mock postMessage proxy, but in normal usage you would likely use the accompanying library [window-post-message-proxy](https://pbix.visualstudio.com/DefaultCollection/PaaS/_git/window-post-message-proxy) and configure it to handle http messages as shown in the section [below](#promiseresolution)

```typescript
import * as hpm from 'http-post-message';

const stubWindowPostMessageProxy: hpm.IPostMessage = {
  postMessage(message: any) {
    console.log(message);
    return Promise.resolve(message):
  }
}

const httpPostMessage = new hpm.HttpPostMessage(stubWindowPostMessageProxy);

httpPostMessage.get('target/path')
  .then(response => {
    ...
  });
```

### Methods
The object supports all the standard http methods, `get`, `post`, `put`, `patch`, and `delete`.
You can also send an `IRequest` object directly to the lower-level `send` method.

### <a name="promiseresolution"></a> Determining promise resolution state
The promise returned by the request will be fulfulled or rejected depending on how the instance of WindowPostMessageProxy provided to the constructor was configured.

Since we intend to use HTTP semantics, this library comes with static methods that can be provided to the WPMP class during construction as seen below:

```javascript
import * as wpmp from 'window-post-message-proxy';
import * as hpm from 'http-post-message';

const windowPostMessageProxy = new wpmp.WindowPostMessageProxy({
  processTrackingProperties: {
      addTrackingProperties: hpm.HttpPostMessage.addTrackingProperties,
      getTrackingProperties: hpm.HttpPostMessage.getTrackingProperties,
  },
  isErrorMessage: hpm.HttpPostMessage.isErrorMessage
});

const httpPostMessage = new hpm.HttpPostMessage(windowPostMessageProxy);
```

### Default Headers and Default Window
You may specify default headers and default target window to be sent with every request by supplying them during construction.

Providing the default target window in the constructor means you do not have to specify it in each individual request, but it can be over written to allow a single instance of HPM to communicate with multiple windows.

```javascript
import * as hpm from 'http-post-message';

...

const httpPostMessage = new hpm.HttpPostMessage(wpmp, {
    'x-sdk-type': sdkType,
    'x-sdk-version': sdkVersion
  }, defaultTargetWindow);
});
```
