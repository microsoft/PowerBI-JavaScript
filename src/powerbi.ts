import PowerBi from './core';

/**
 * Make PowerBi available on global object for use in apps without module loading support.
 * Save class to allow creating an instance of the service.
 * Create instance of class with default config for normal usage.
 */
(<any>window).Powerbi = PowerBi;
(<any>window).powerbi = new PowerBi();