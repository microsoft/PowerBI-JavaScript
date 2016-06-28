/*! powerbi-client v2.0.0-beta.6 | (c) 2016 Microsoft Corporation MIT */
import * as service from './service';
import * as factories from './factories';
export { service, factories };
export * from './report';
export * from './tile';
export * from './embed';
declare global  {
    interface Window {
        Powerbi: typeof service.Service;
        powerbi: service.Service;
    }
}
