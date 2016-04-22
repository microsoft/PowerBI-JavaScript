export default class Utils {
    static raiseCustomEvent(element: HTMLElement, eventName: string, eventData: any) {
        let customEvent;
        if (typeof CustomEvent === 'function') {
            customEvent = new CustomEvent(eventName, {
                detail: eventData,
                bubbles: true,
                cancelable: true
            });
        } else {
            customEvent = document.createEvent('CustomEvent');
            customEvent.initCustomEvent(eventName, true, true, eventData);
        }

        element.dispatchEvent(customEvent);
        if (customEvent.defaultPrevented || !customEvent.returnValue) {
            return;
        }

        // TODO: Remove this? Should be better way to handle events than using eval?
        // What is use case? <div powerbi-type="report" onload="alert('loaded');"></div>
        const inlineEventAttr = 'on' + eventName.replace('-', '');
        const inlineScript = element.getAttribute(inlineEventAttr);
        if (inlineScript) {
            eval.call(element, inlineScript);
        }
    }
    
    static findIndex<T>(predicate: (T) => boolean, xs: T[]): number {
        if(!Array.isArray(xs)) {
            throw new Error(`You attempted to call find with second parameter that was not an array. You passed: ${xs}`);
        }
        
        let index;
        xs.some((x, i) => {
            if(predicate(x)) {
                index = i;
                return true;
            }
        });
        
        return index;
    }
    
    static find<T>(predicate: (T) => boolean, xs: T[]): T {
        const index = Utils.findIndex(predicate, xs);
        return xs[index];
    }
    
    static remove<T>(predicate: (T) => boolean, xs: T[]): void {
        const index = Utils.findIndex(predicate, xs);
        xs.splice(index, 1);
    }
    
    // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    // TODO: replace in favor of using polyfill
    static assign = function (...args) {
        var target = args[0];
        
        'use strict';
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
}