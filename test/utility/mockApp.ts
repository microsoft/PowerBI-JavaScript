import * as models from 'powerbi-models';

export interface IApp {
  // Load
  dashboardLoad(config: models.IDashboardLoadConfiguration): Promise<void>;
  validateDashboardLoad(config: models.IDashboardLoadConfiguration): Promise<models.IError[]>;
  reportLoad(config: models.IReportLoadConfiguration): Promise<void>;
  validateReportLoad(config: models.IReportLoadConfiguration): Promise<models.IError[]>;
  render(): Promise<void>;
  // Settings
  updateSettings(settings: models.ISettings): Promise<void>;
  validateSettings(settigns: models.ISettings): Promise<models.IError[]>;
  // Pages
  getPages(): Promise<models.IPage>;
  setPage(pageName: string): Promise<void>;
  validatePage(page: models.IPage): Promise<models.IError[]>;
  // Visuals
  validateVisual(page: models.IPage, visual: models.IVisual): Promise<models.IError[]>;
  // Filters
  getFilters(): Promise<models.IFilter[]>;
  setFilters(filters: models.IFilter[]): Promise<void>;
  validateFilter(filter: models.IFilter): Promise<models.IError[]>;
  // Other
  print(): Promise<void>;
  refreshData(): Promise<void>;
  exportData(): Promise<void>;
  validateCreateReport(config: models.IReportCreateConfiguration): Promise<models.IError[]>;
  switchMode(): Promise<void>;
  save(): Promise<void>;
  saveAs(saveAsParameters: models.ISaveAsParameters): Promise<void>;
  setAccessToken(accessToken: string): Promise<void>;
}

export const mockAppSpyObj = {
  // Load
  dashboardLoad: jasmine.createSpy("dashboardLoad").and.returnValue(Promise.resolve(null)),
  validateDashboardLoad: jasmine.createSpy("validateDashboardLoad").and.callFake(models.validateDashboardLoad),
  reportLoad: jasmine.createSpy("reportLoad").and.returnValue(Promise.resolve(null)),
  validateReportLoad: jasmine.createSpy("validateReportLoad").and.callFake(models.validateReportLoad),
  render: jasmine.createSpy("render").and.returnValue(Promise.resolve(null)),
  // Settings
  updateSettings: jasmine.createSpy("updateSettings").and.returnValue(Promise.resolve(null)),
  validateSettings: jasmine.createSpy("validateSettings").and.callFake(models.validateSettings),
  // Pages
  getPages: jasmine.createSpy("getPages").and.returnValue(Promise.resolve(null)),
  setPage: jasmine.createSpy("setPage").and.returnValue(Promise.resolve(null)),
  validatePage: jasmine.createSpy("validatePage").and.returnValue(Promise.resolve(null)),
  // Visuals
  validateVisual: jasmine.createSpy("validateVisual").and.returnValue(Promise.resolve(null)),
  // Filters
  getFilters: jasmine.createSpy("getFilters").and.returnValue(Promise.resolve(null)),
  setFilters: jasmine.createSpy("setFilters").and.returnValue(Promise.resolve(null)),
  validateFilter: jasmine.createSpy("validateFilter").and.callFake(models.validateFilter),
  // Other
  print: jasmine.createSpy("print").and.returnValue(Promise.resolve(null)),
  refreshData: jasmine.createSpy("refreshData").and.returnValue(Promise.resolve(null)),
  exportData: jasmine.createSpy("exportData").and.returnValue(Promise.resolve(null)),
  validateCreateReport: jasmine.createSpy("validateCreateReport").and.callFake(models.validateCreateReport),
  switchMode: jasmine.createSpy("switchMode").and.returnValue(Promise.resolve(null)),
  save: jasmine.createSpy("save").and.returnValue(Promise.resolve(null)),
  saveAs: jasmine.createSpy("saveAs").and.returnValue(Promise.resolve(null)),
  setAccessToken: jasmine.createSpy("setAccessToken").and.returnValue(Promise.resolve(null)),

  reset() {
    mockAppSpyObj.dashboardLoad.calls.reset();
    mockAppSpyObj.validateDashboardLoad.calls.reset();
    mockAppSpyObj.reportLoad.calls.reset();
    mockAppSpyObj.validateReportLoad.calls.reset();
    mockAppSpyObj.updateSettings.calls.reset();
    mockAppSpyObj.validateSettings.calls.reset();
    mockAppSpyObj.getPages.calls.reset();
    mockAppSpyObj.setPage.calls.reset();
    mockAppSpyObj.validatePage.calls.reset();
    mockAppSpyObj.validateVisual.calls.reset();
    mockAppSpyObj.getFilters.calls.reset();
    mockAppSpyObj.setFilters.calls.reset();
    mockAppSpyObj.validateFilter.calls.reset();
    mockAppSpyObj.print.calls.reset();
    mockAppSpyObj.refreshData.calls.reset();
    mockAppSpyObj.exportData.calls.reset();
    mockAppSpyObj.validateCreateReport.calls.reset();
    mockAppSpyObj.switchMode.calls.reset();
    mockAppSpyObj.save.calls.reset();
    mockAppSpyObj.saveAs.calls.reset();
    mockAppSpyObj.setAccessToken.calls.reset();
  }
};

export const mockApp: IApp = mockAppSpyObj;
