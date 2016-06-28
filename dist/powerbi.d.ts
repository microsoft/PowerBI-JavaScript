/*! powerbi-client v2.0.0-beta.6 | (c) 2016 Microsoft Corporation MIT */
import { Service } from './service';
import * as factories from './factories';
export { Service, factories };
export * from './report';
export * from './tile';
export * from './embed';
declare global  {
    interface Window {
        Powerbi: typeof Service;
        powerbi: Service;
    }
}
