// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * @hidden
 */
import * as models from 'powerbi-models';
import * as service from './service';
import * as factories from './factories';
import { IFilterable } from './ifilterable';

export {
  IFilterable,
  service,
  factories,
  models
};
export {
  Report
} from './report';
export {
  Dashboard
} from './dashboard';
export {
  Tile
} from './tile';
export {
  IEmbedConfiguration,
  IQnaEmbedConfiguration,
  IVisualEmbedConfiguration,
  IReportEmbedConfiguration,
  IDashboardEmbedConfiguration,
  ITileEmbedConfiguration,
  Embed,
  ILocaleSettings,
  IEmbedSettings,
  IQnaSettings,
} from './embed';
export {
  Page
} from './page';
export {
  Qna
} from './qna';
export {
  Visual
} from './visual';
export {
  VisualDescriptor
} from './visualDescriptor';
export {
  BasicFilterBuilder,
  AdvancedFilterBuilder,
  TopNFilterBuilder,
  RelativeDateFilterBuilder,
  RelativeTimeFilterBuilder
} from './FilterBuilders';

declare var powerbi: service.Service;
declare global {
  interface Window {
    powerbi: service.Service;
    powerBISDKGlobalServiceInstanceName?: string;
  }
}

/**
 * Makes Power BI available to the global object for use in applications that don't have module loading support.
 *
 * Note: create an instance of the class with the default configuration for normal usage, or save the class so that you can create an instance of the service.
 */
var powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);
// powerBI SDK may use Power BI object under different key, in order to avoid name collisions
if (window.powerbi && window.powerBISDKGlobalServiceInstanceName) {
  window[window.powerBISDKGlobalServiceInstanceName] = powerbi;
} else {
  // Default to Power BI.
  window.powerbi = powerbi;
}
