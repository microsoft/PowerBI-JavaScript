/**
 * TODO: Need to find better place for these factory functions or refactor how we handle dependency injection
 * Need to 
 */
import { IHpmFactory, IWpmpFactory, IRouterFactory } from './embed';
import * as wpmp from 'window-post-message-proxy';
import * as hpm from 'http-post-message';
import * as router from 'powerbi-router';

export {
  IHpmFactory,
  IWpmpFactory,
  IRouterFactory
};

export const hpmFactory: IHpmFactory = (wpmp, sdkVersion = '2.0.0', sdkType = 'js', origin = 'sdk') => {
    return new hpm.HttpPostMessage(wpmp, {
        'origin': origin,
        'x-sdk-type': sdkType,
        'x-sdk-version': sdkVersion
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

export const routerFactory: IRouterFactory = (wpmp) => {
  return new router.Router(wpmp);
};