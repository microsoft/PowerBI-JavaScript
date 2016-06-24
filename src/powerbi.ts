import { Service } from './service';
import * as factories from './factories';

declare global {
    interface Window {
        Powerbi: typeof Service;
        powerbi: Service;
    }
}

/**
 * Make PowerBi available on global object for use in apps without module loading support.
 * Save class to allow creating an instance of the service.
 * Create instance of class with default config for normal usage.
 */
window.Powerbi = Service;
window.powerbi = new Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);