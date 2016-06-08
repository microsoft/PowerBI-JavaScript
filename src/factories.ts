/**
 * TODO: Need to find better place for these factory functions or refactor how we handle dependency injection
 * Need to 
 */
import { IHpmFactory, IWpmpFactory } from './embed';
import * as wpmp from 'window-post-message-proxy';
import * as hpm from 'http-post-message';

export {
  IHpmFactory,
  IWpmpFactory
};

export const hpmFactory: IHpmFactory = (wpmp) => {
    return new hpm.HttpPostMessage(wpmp, {
        'origin': 'sdk',
        'x-sdk-type': 'js',
        'x-sdk-version': '2.0.0'
    });
};

export const wpmpFactory: IWpmpFactory = (window, name?: string, logMessages?: boolean) => {
    return new wpmp.WindowPostMessageProxy(window, {
        processTrackingProperties: {
            addTrackingProperties: hpm.HttpPostMessage.addTrackingProperties,
            getTrackingProperties: hpm.HttpPostMessage.getTrackingProperties,
        },
        isErrorMessage: hpm.HttpPostMessage.isErrorMessage,
        name,
        logMessages
    });
};