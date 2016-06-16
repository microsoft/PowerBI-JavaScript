/**
 * These are the methods that should be implemented and exposed in the PowerBI angular application which can be invoked from the ReportEmbed iframe.
 */

export interface ILoad {
  reportId: string;
  accessToken: string;
  options: IOptions;
}

export interface IOptions {
  filterPaneEnabled: boolean;
  pageNavigationEnabled: boolean;
}

export interface IPage {
  name: string;
  displayName: string;
}

export interface ITarget {
  // TODO?
}

// TODO: Replace with actual filters from 'powerbi-filters' package
export interface IFilter {
  // TODO?
}

export interface IValidationResponse {
  errors: any[];
}

export interface IApp {
  // Load
  load(config: ILoad): Promise<void>;
  validateLoad(config: ILoad): Promise<IValidationResponse>;
  // Settings
  updateSettings(settings: IOptions): Promise<void>;
  validateSettings(settigns: IOptions): Promise<IValidationResponse>;
  
  // Pages
  getPages(): Promise<IPage>;
  setPage(pageName: string): Promise<void>;
  togglePageNavigation(): Promise<void>;
  validatePage(page: IPage): Promise<IValidationResponse>;
  // Filters
  validateFilter(filter: IFilter): Promise<IValidationResponse>;
  validateTarget(target: ITarget): Promise<IValidationResponse>;
  getFilters(target?: ITarget): Promise<IFilter[]>;
  addFilter(filter: IFilter, target?: ITarget): Promise<void>;
  updateFilter(filter: IFilter, target?: ITarget): Promise<void>;
  removeFilter(filter: IFilter, target?: ITarget): Promise<void>;
  clearFilters(target?: ITarget): Promise<void>;
  toggleFilterPane(): Promise<void>;
  // Other
  exportData(target: ITarget): Promise<void>;
}

export const mockAppSpyObj = {
  // Load
  load: jasmine.createSpy("load").and.returnValue(Promise.resolve(null)),
  validateLoad: jasmine.createSpy("validateLoad").and.returnValue(Promise.resolve(null)),
  // Settings
  updateSettings: jasmine.createSpy("updateSettings").and.returnValue(Promise.resolve(null)),
  validateSettings: jasmine.createSpy("validateSettings").and.returnValue(Promise.resolve(null)),
  // Pages
  getPages: jasmine.createSpy("getPages").and.returnValue(Promise.resolve(null)),
  setPage: jasmine.createSpy("setPage").and.returnValue(Promise.resolve(null)),
  togglePageNavigation: jasmine.createSpy("togglePageNavigation").and.returnValue(Promise.resolve(null)),
  validatePage: jasmine.createSpy("validatePage").and.returnValue(Promise.resolve(null)),
  // Filters
  validateFilter: jasmine.createSpy("validateFilter").and.returnValue(Promise.resolve(null)),
  validateTarget: jasmine.createSpy("validateTarget").and.returnValue(Promise.resolve(null)),
  getFilters: jasmine.createSpy("getFilters").and.returnValue(Promise.resolve(null)),
  addFilter: jasmine.createSpy("addFilter").and.returnValue(Promise.resolve(null)),
  updateFilter: jasmine.createSpy("updateFilter").and.returnValue(Promise.resolve(null)),
  removeFilter: jasmine.createSpy("removeFilter").and.returnValue(Promise.resolve(null)),
  clearFilters: jasmine.createSpy("clearFilters").and.returnValue(Promise.resolve(null)),
  toggleFilterPane: jasmine.createSpy("toggleFilterPane").and.returnValue(Promise.resolve(null)),
  // Other
  exportData: jasmine.createSpy("exportData").and.returnValue(Promise.resolve(null)),

  reset() {
    mockAppSpyObj.load.calls.reset();
    mockAppSpyObj.validateLoad.calls.reset();
    mockAppSpyObj.updateSettings.calls.reset();
    mockAppSpyObj.validateSettings.calls.reset();
    mockAppSpyObj.getPages.calls.reset();
    mockAppSpyObj.setPage.calls.reset();
    mockAppSpyObj.togglePageNavigation.calls.reset();
    mockAppSpyObj.validatePage.calls.reset();
    mockAppSpyObj.validateFilter.calls.reset();
    mockAppSpyObj.validateTarget.calls.reset();
    mockAppSpyObj.getFilters.calls.reset();
    mockAppSpyObj.addFilter.calls.reset();
    mockAppSpyObj.updateFilter.calls.reset();
    mockAppSpyObj.removeFilter.calls.reset();
    mockAppSpyObj.clearFilters.calls.reset();
    mockAppSpyObj.toggleFilterPane.calls.reset();
  }
};

export const mockApp: IApp = mockAppSpyObj;
