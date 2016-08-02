import * as service from './service';
import * as factories from './factories';
import * as models from 'powerbi-models';
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
    Tile
} from './tile';
export {
    IEmbedConfiguration,
    Embed
} from './embed';
export {
    Page
} from './page';
export {
    Visual
} from './visual';

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