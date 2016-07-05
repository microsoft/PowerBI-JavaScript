/**
 * TODO: Need to find better place for these factory functions or refactor how we handle dependency injection
 */
import { IHpmFactory, IWpmpFactory, IRouterFactory } from './service';
import * as wpmp from 'window-post-message-proxy';
import * as hpm from 'http-post-message';
import * as router from 'powerbi-router';

export {
  IHpmFactory,
  IWpmpFactory,
  IRouterFactory
};

/**
 * TODO: Need to get sdk version and settings from package.json, Generate config file via gulp task?
 */
export const hpmFactory: IHpmFactory = (wpmp, defaultTargetWindow, sdkVersion = '2.0.0', sdkType = 'js', origin = 'sdk') => {
    return new hpm.HttpPostMessage(wpmp, {
        'origin': origin,
        'x-sdk-type': sdkType,
        'x-sdk-version': sdkVersion
    }, defaultTargetWindow);
};

export const wpmpFactory: IWpmpFactory = (name?: string, logMessages?: boolean, eventSourceOverrideWindow?: Window) => {
    return new wpmp.WindowPostMessageProxy({
        processTrackingProperties: {
            addTrackingProperties: hpm.HttpPostMessage.addTrackingProperties,
            getTrackingProperties: hpm.HttpPostMessage.getTrackingProperties,
        },
        isErrorMessage: hpm.HttpPostMessage.isErrorMessage,
        name,
        logMessages,
        eventSourceOverrideWindow
    });
};

export const routerFactory: IRouterFactory = (wpmp) => {
  return new router.Router(wpmp);
};