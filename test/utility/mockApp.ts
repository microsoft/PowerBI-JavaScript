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
  validatePage(page: models.IPage): Promise<models.IError[]>;
  // Visuals
  getVisuals(page: models.IPage): Promise<models.IVisual>;
  validateVisual(visual: models.IVisual): Promise<models.IError[]>;
  // Filters
  getFilters(): Promise<models.IFilter[]>;
  setFilters(filters: models.IFilter[]): Promise<void>;
  validateFilter(filter: models.IFilter): Promise<models.IError[]>;
  // Other
  print(): Promise<void>;
  refreshData(): Promise<void>;
  exportData(): Promise<void>;
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
  validatePage: jasmine.createSpy("validatePage").and.returnValue(Promise.resolve(null)),
  // Visuals
  getVisuals: jasmine.createSpy("getVisuals").and.returnValue(Promise.resolve(null)),
  validateVisual: jasmine.createSpy("validateVisual").and.returnValue(Promise.resolve(null)),
  // Filters
  getFilters: jasmine.createSpy("getFilters").and.returnValue(Promise.resolve(null)),
  setFilters: jasmine.createSpy("setFilters").and.returnValue(Promise.resolve(null)),
  validateFilter: jasmine.createSpy("validateFilter").and.callFake(models.validateFilter),
  // Other
  print: jasmine.createSpy("print").and.returnValue(Promise.resolve(null)),
  refreshData: jasmine.createSpy("refreshData").and.returnValue(Promise.resolve(null)),
  exportData: jasmine.createSpy("exportData").and.returnValue(Promise.resolve(null)),

  reset() {
    mockAppSpyObj.load.calls.reset();
    mockAppSpyObj.validateLoad.calls.reset();
    mockAppSpyObj.updateSettings.calls.reset();
    mockAppSpyObj.validateSettings.calls.reset();
    mockAppSpyObj.getPages.calls.reset();
    mockAppSpyObj.setPage.calls.reset();
    mockAppSpyObj.validatePage.calls.reset();
    mockAppSpyObj.getVisuals.calls.reset();
    mockAppSpyObj.validateVisual.calls.reset();
    mockAppSpyObj.getFilters.calls.reset();
    mockAppSpyObj.setFilters.calls.reset();
    mockAppSpyObj.validateFilter.calls.reset();
    mockAppSpyObj.print.calls.reset();
    mockAppSpyObj.refreshData.calls.reset();
    mockAppSpyObj.exportData.calls.reset();
  }
};

export const mockApp: IApp = mockAppSpyObj;
