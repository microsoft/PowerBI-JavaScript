(function (powerbi) {
    'use strict';
    
    powerbi.utils = {
        raiseCustomEvent: raiseCustomEvent
    };

    function raiseCustomEvent(element, eventName, eventData) {
        var customEvent;
        if (typeof (window.CustomEvent) === 'function') {
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

        var inlineEventAttr = 'on' + eventName.replace('-', '');
        var inlineScript = element.getAttribute(inlineEventAttr);
        if (inlineScript) {
            eval.call(element, inlineScript);
        }
    }
} (window.powerbi = window.powerbi || {}));