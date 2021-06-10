// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
  addContextMenuCommand(commandName: string, commandTitle: string, contextMenuTitle: string, menuLocation?: string, visualName?: string, visualType?: string, groupName?: string): Promise<void>;
  addOptionsMenuCommand(commandName: string, commandTitle: string, optionsMenuTitle: string, menuLocation?: string, visualName?: string, visualType?: string, groupName?: string, commandIcon?: string): Promise<void>;
  removeContextMenuCommand(commandName: string): Promise<void>;
  removeOptionsMenuCommand(commandName: string): Promise<void>;
  setVisualDisplayState(pageName: string, visualName: string, displayState: models.VisualContainerDisplayMode): Promise<void>;
  resizeVisual(pageName: string, visualName: string, width: number, height: number): Promise<void>;
  resizeActivePage(pageSizeType: models.PageSizeType, width: number, height: number): Promise<void>;
  moveVisual(pageName: string, visualName: string, x: number, y: number, z?: number): Promise<void>;
  // Pages
  getPages(): Promise<models.IPage>;
  getPageByName(pageName: string): Promise<models.IPage>;
  getActivePage(): Promise<models.IPage>;
  setPage(pageName: string): Promise<void>;
  validatePage(page: models.IPage): Promise<models.IError[]>;
  // Visuals
  validateVisual(page: models.IPage, visual: models.IVisual): Promise<models.IError[]>;
  getVisualByName(visualName: string): Promise<models.IVisual>;
  // Filters
  getFilters(): Promise<models.IFilter[]>;
  updateFilters(operation: models.FiltersOperations, filters: models.IFilter[]): Promise<models.IFilter[]>;
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
  switchLayout(layoutType: models.LayoutType): Promise<void>;
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
  addContextMenuCommand: jasmine.createSpy("addContextMenuCommand").and.returnValue(Promise.resolve(null)),
  addOptionsMenuCommand: jasmine.createSpy("addOptionsMenuCommand").and.returnValue(Promise.resolve(null)),
  removeContextMenuCommand: jasmine.createSpy("removeContextMenuCommand").and.returnValue(Promise.resolve(null)),
  removeOptionsMenuCommand: jasmine.createSpy("removeOptionsMenuCommand").and.returnValue(Promise.resolve(null)),
  setVisualDisplayState: jasmine.createSpy("setVisualDisplayState").and.returnValue(Promise.resolve(null)),
  resizeVisual: jasmine.createSpy("resizeVisual").and.returnValue(Promise.resolve(null)),
  resizeActivePage: jasmine.createSpy("resizeActivePage").and.returnValue(Promise.resolve(null)),
  moveVisual: jasmine.createSpy("moveVisual").and.returnValue(Promise.resolve(null)),
  // Pages
  getPages: jasmine.createSpy("getPages").and.returnValue(Promise.resolve(null)),
  getPageByName: jasmine.createSpy("getPageByName").and.returnValue(Promise.resolve(null)),
  getActivePage: jasmine.createSpy("getActivePage").and.returnValue(Promise.resolve(null)),
  setPage: jasmine.createSpy("setPage").and.returnValue(Promise.resolve(null)),
  validatePage: jasmine.createSpy("validatePage").and.returnValue(Promise.resolve(null)),
  // Visuals
  validateVisual: jasmine.createSpy("validateVisual").and.returnValue(Promise.resolve(null)),
  getVisualByName: jasmine.createSpy("getVisualByName").and.returnValue(Promise.resolve(null)),
  // Filters
  getFilters: jasmine.createSpy("getFilters").and.returnValue(Promise.resolve(null)),
  updateFilters: jasmine.createSpy("updateFilters").and.returnValue(Promise.resolve(null)),
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
  switchLayout: jasmine.createSpy("switchLayout").and.returnValue(Promise.resolve(null)),

  reset() {
    mockAppSpyObj.dashboardLoad.calls.reset();
    mockAppSpyObj.validateDashboardLoad.calls.reset();
    mockAppSpyObj.reportLoad.calls.reset();
    mockAppSpyObj.render.calls.reset();
    mockAppSpyObj.validateReportLoad.calls.reset();
    mockAppSpyObj.updateSettings.calls.reset();
    mockAppSpyObj.validateSettings.calls.reset();
    mockAppSpyObj.setVisualDisplayState.calls.reset();
    mockAppSpyObj.resizeVisual.calls.reset();
    mockAppSpyObj.resizeActivePage.calls.reset();
    mockAppSpyObj.moveVisual.calls.reset();
    mockAppSpyObj.getPages.calls.reset();
    mockAppSpyObj.getPageByName.calls.reset();
    mockAppSpyObj.getActivePage.calls.reset();
    mockAppSpyObj.setPage.calls.reset();
    mockAppSpyObj.validatePage.calls.reset();
    mockAppSpyObj.validateVisual.calls.reset();
    mockAppSpyObj.getVisualByName.calls.reset();
    mockAppSpyObj.getFilters.calls.reset();
    mockAppSpyObj.updateFilters.calls.reset();
    mockAppSpyObj.setFilters.calls.reset();
    mockAppSpyObj.validateFilter.calls.reset();
    mockAppSpyObj.addContextMenuCommand.calls.reset();
    mockAppSpyObj.addOptionsMenuCommand.calls.reset();
    mockAppSpyObj.removeContextMenuCommand.calls.reset();
    mockAppSpyObj.removeOptionsMenuCommand.calls.reset();
    mockAppSpyObj.print.calls.reset();
    mockAppSpyObj.refreshData.calls.reset();
    mockAppSpyObj.exportData.calls.reset();
    mockAppSpyObj.validateCreateReport.calls.reset();
    mockAppSpyObj.switchMode.calls.reset();
    mockAppSpyObj.save.calls.reset();
    mockAppSpyObj.saveAs.calls.reset();
    mockAppSpyObj.setAccessToken.calls.reset();
    mockAppSpyObj.switchLayout.calls.reset();
  }
};

export const mockApp: IApp = mockAppSpyObj;
