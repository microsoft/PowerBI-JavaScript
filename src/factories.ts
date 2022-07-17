// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * TODO: Need to find better place for these factory functions or refactor how we handle dependency injection
 */
import { WindowPostMessageProxy } from 'window-post-message-proxy';
import { HttpPostMessage } from 'http-post-message';
import { Router } from 'powerbi-router';
import config from './config';
import { IHpmFactory, IWpmpFactory, IRouterFactory } from './service';

export {
  IHpmFactory,
  IWpmpFactory,
  IRouterFactory
};

export const hpmFactory: IHpmFactory = (wpmp, defaultTargetWindow, sdkVersion = config.version, sdkType = config.type, sdkWrapperVersion?: string) => {
  return new HttpPostMessage(wpmp, {
    'x-sdk-type': sdkType,
    'x-sdk-version': sdkVersion,
    'x-sdk-wrapper-version': sdkWrapperVersion,
  }, defaultTargetWindow);
};

export const wpmpFactory: IWpmpFactory = (name?: string, logMessages?: boolean, eventSourceOverrideWindow?: Window) => {
  return new WindowPostMessageProxy({
    processTrackingProperties: {
      addTrackingProperties: HttpPostMessage.addTrackingProperties,
      getTrackingProperties: HttpPostMessage.getTrackingProperties,
    },
    isErrorMessage: HttpPostMessage.isErrorMessage,
    suppressWarnings: true,
    name: name,
    logMessages: logMessages,
    eventSourceOverrideWindow: eventSourceOverrideWindow
  });
};

export const routerFactory: IRouterFactory = (wpmp) => {
  return new Router(wpmp);
};
