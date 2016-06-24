import * as models from 'powerbi-models';

export interface IApp {
  // Load
  load(config: models.ILoadConfiguration): Promise<void>;
  validateLoad(config: models.ILoadConfiguration): Promise<models.IError[]>;
  // Settings
  updateSettings(settings: models.ISettings): Promise<void>;
  validateSettings(settigns: models.ISettings): Promise<models.IError[]>;
  
  // Pages
  getPages(): Promise<models.IPage>;
  setPage(pageName: string): Promise<void>;
  togglePageNavigation(): Promise<void>;
  validatePage(page: models.IPage): Promise<models.IError[]>;
  // Filters
  validateFilter(filter: models.IFilter): Promise<models.IError[]>;
  validateTarget(target: models.ITarget): Promise<models.IError[]>;
  getFilters(target?: models.ITarget): Promise<models.IFilter[]>;
  addFilter(filter: models.IFilter, target?: models.ITarget): Promise<void>;
  updateFilter(filter: models.IFilter, target?: models.ITarget): Promise<void>;
  removeFilter(filter: models.IFilter, target?: models.ITarget): Promise<void>;
  clearFilters(target?: models.ITarget): Promise<void>;
  toggleFilterPane(): Promise<void>;
  // Other
  exportData(target: models.ITarget): Promise<void>;
}

export const mockAppSpyObj = {
  // Load
  load: jasmine.createSpy("load").and.returnValue(Promise.resolve(null)),
  validateLoad: jasmine.createSpy("validateLoad").and.callFake(models.validateLoad),
  // Settings
  updateSettings: jasmine.createSpy("updateSettings").and.returnValue(Promise.resolve(null)),
  validateSettings: jasmine.createSpy("validateSettings").and.callFake(models.validateSettings),
  // Pages
  getPages: jasmine.createSpy("getPages").and.returnValue(Promise.resolve(null)),
  setPage: jasmine.createSpy("setPage").and.returnValue(Promise.resolve(null)),
  togglePageNavigation: jasmine.createSpy("togglePageNavigation").and.returnValue(Promise.resolve(null)),
  validatePage: jasmine.createSpy("validatePage").and.returnValue(Promise.resolve(null)),
  // Filters
  validateFilter: jasmine.createSpy("validateFilter").and.callFake(models.validateFilter),
  validateTarget: jasmine.createSpy("validateTarget").and.callFake(models.validateTarget),
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
