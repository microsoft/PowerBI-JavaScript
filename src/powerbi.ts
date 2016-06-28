import * as service from './service';
import * as factories from './factories';

export {
    service,
    factories
};
export * from './report';
export * from './tile';
export * from './embed';

declare global {
    interface Window {
        Powerbi: typeof service.Service;
        powerbi: service.Service;
    }
}

/**
 * Make PowerBi available on global object for use in apps without module loading support.
 * Save class to allow creating an instance of the service.
 * Create instance of class with default config for normal usage.
 */
window.Powerbi = service.Service;
window.powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);