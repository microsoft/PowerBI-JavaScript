import { PowerBi } from './service';
import * as factories from './factories';

declare global {
    interface Window {
        Powerbi: typeof PowerBi;
        powerbi: PowerBi;
    }
}

/**
 * Make PowerBi available on global object for use in apps without module loading support.
 * Save class to allow creating an instance of the service.
 * Create instance of class with default config for normal usage.
 */
window.Powerbi = PowerBi;
window.powerbi = new PowerBi(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);