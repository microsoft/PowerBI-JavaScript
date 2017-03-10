# window-post-message-proxy
[![Travis branch](https://img.shields.io/travis/Microsoft/window-post-message-proxy.svg)](https://travis-ci.org/Microsoft/window-post-message-proxy)
[![npm](https://img.shields.io/npm/v/window-post-message-proxy.svg)](https://www.npmjs.com/package/window-post-message-proxy)
[![Total Downloads](https://img.shields.io/npm/dt/window-post-message-proxy.svg)](https://www.npmjs.com/package/window-post-message-proxy)
[![Monthly Downloads](https://img.shields.io/npm/dm/window-post-message-proxy.svg)](https://www.npmjs.com/package/window-post-message-proxy)
[![GitHub tag](https://img.shields.io/github/tag/microsoft/window-post-message-proxy.svg)](https://github.com/Microsoft/window-post-message-proxy)

A library used in place of the native window.postMessage which when used on both the sending and receiving windows allow for a nicer asynchronous promise messaging between the windows.

When sending messages using the proxy, it will apply a unique id to the message, create a deferred object referenced by the id, and pass the message on to the target window.
The target window will also have an instance of the windowPostMessage proxy setup which will send back messages and preserve the unique id.
Then the original sending instance receives the response message with id, it will look to see if there is matching id in cache and if so resolve the deferred object with the response.

## Documentation
### [https://microsoft.github.io/window-post-message-proxy](https://microsoft.github.io/window-post-message-proxy)

## Installation

```bash
npm install --save window-post-message-proxy
```

## Basic Usage

```typescript
// Setup
const iframe = document.getElementById("myFrame");
const windowPostMessageProxy = new WindowPostMessageProxy();

// Send message
const message = {
    key: "Value"
};

windowPostMessageProxy.postMessage(iframe.conentWindow, message)
    .then(response => {
        
    });
```

## Advanced Customization

### Customizing how tracking properties are added to the method

By default the windowPostMessage proxy will store the tracking properties as object on the message by known property: `windowPostMesssageProxy`.

This means if you call:

```typescript
const message = {
    key: "Value"
};

windowPostMessageProxy.postMessage(iframe.conentWindow, message);
```
The message is actually modified before it's sent to become:

```typescript
{
    windowPostMessageProxy: {
        id: "ebixvvlbwa3tvtjra4i"
    },
    key: "Value"
};
```

If you want to customize how the tracking properties are added to and retrieved from the message you can provide it at construction time as an object with two functions. See the interface below:

```typescript
export interface IProcessTrackingProperties {
  addTrackingProperties<T>(message: T, trackingProperties: ITrackingProperties): T;
  getTrackingProperties(message: any): ITrackingProperties;
}
```
`addTrackingProperties` takes a message and adds the tracking properties object and returns the message.
`getTrackingProperties` takes a message and extracts the tracking properties.


Example:

```typescript
const customProcessTrackingProperties = {
    addTrackingProperties(message, trackingProperties) {
        message.headers = {
            'tracking-id': trackingProperties.id
        };
        
        return message;
    },
    getTrackingProperties(message): ITrackingProperties {
        return {
            id: message.headers['tracking-id']
        };
    }
};
const windowPostMessageProxy = new WindowPostMessageProxy(customProcessTrackingProperties);
```

### Customizing how messages are detected as error responses.

By default response messages are considered error message if they contain an error property.

You can override this behavior by passing an `isErrorMessage` function at construction time. See interface:

```typescript
export interface IIsErrorMessage {
  (message: any): boolean;
}
```

Example:

```typescript
function isErrorMessage(message: any) {
    return !(200 <= message.status && message.status < 300);
}

const windowPostMessageProxy = new WindowPostMessageProxy({ isErrorMessage });
```

### Logging messages

By default messages are not logged, but you can override this behavior by passing `logMessages: true` in the options object.

```typescript
const windowPostMessageProxy = new WindowPostMessageProxy({ logMessages: true });
```
This will print out a stringified JSON of each object that is received or sent by the specific instance.

### Supplying custom name
Each windowPostMessageProxy gives itself a randomly generated name so you can see which instance is communicating in the log messages.
Often times you may want to pass a custom name for which window the windowPostMessageProxy instance is running.

You can provided a name by passing `name: 'Iframe'` in the options object.

```typescript
const windowPostMessageProxy = new WindowPostMessageProxy({ name: 'Iframe' });
```

### Supress Warning Message about unhandled messages
By default the window post message proxy will warn you if it received a message that was not handled since this is usually an indication of error; however,
if you are register multiple window message handlers the message may handled but it's just not able to be known by the windowPostMessageProxy and this warning no longer applies.

```typescript
const windowPostMessageProxy = new WindowPostMessageProxy({ suppressMessageNotHandledWarning: true });
```
