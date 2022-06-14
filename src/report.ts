// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IReportLoadConfiguration,
  IReportEmbedConfiguration,
  IPage,
  FiltersOperations,
  IError,
  IFilter,
  IReportTheme,
  ISettings,
  IUpdateFiltersRequest,
  LayoutType,
  SectionVisibility,
  validateReportLoad,
  validatePaginatedReportLoad,
  ViewMode,
  IEmbedConfiguration,
  IEmbedConfigurationBase,
  CommonErrorCodes,
  ReportLevelFilters,
  MenuLocation,
  ICommandExtension,
  IExtensions,
  IFlatMenuExtension,
  IGroupedMenuExtension,
  IExtension,
  IVisualLayout,
  ICustomPageSize,
  PageSizeType,
  VisualContainerDisplayMode
} from 'powerbi-models';
import { IHttpPostMessageResponse } from 'http-post-message';
import { IService, Service } from './service';
import { Embed, IEmbedSettings } from './embed';
import { addParamToUrl, assign, isRDLEmbed, isSavedInternal } from './util';
import { APINotSupportedForRDLError } from './errors';
import { IFilterable } from './ifilterable';
import { Page } from './page';
import { BookmarksManager } from './bookmarksManager';
import { VisualDescriptor } from './visualDescriptor';
import * as assert from 'assert';

/**
 * A Report node within a report hierarchy
 *
 * @export
 * @interface IReportNode
 */
export interface IReportNode {
  iframe: HTMLIFrameElement;
  service: IService;
  config: IEmbedConfiguration | IReportEmbedConfiguration;
}

/**
 * The Power BI Report embed component
 *
 * @export
 * @class Report
 * @extends {Embed}
 * @implements {IReportNode}
 * @implements {IFilterable}
 */
export class Report extends Embed implements IReportNode, IFilterable {
  /** @hidden */
  static allowedEvents = ["filtersApplied", "pageChanged", "commandTriggered", "swipeStart", "swipeEnd", "bookmarkApplied", "dataHyperlinkClicked", "visualRendered", "visualClicked", "selectionChanged", "renderingStarted"];
  /** @hidden */
  static reportIdAttribute = 'powerbi-report-id';
  /** @hidden */
  static filterPaneEnabledAttribute = 'powerbi-settings-filter-pane-enabled';
  /** @hidden */
  static navContentPaneEnabledAttribute = 'powerbi-settings-nav-content-pane-enabled';
  /** @hidden */
  static typeAttribute = 'powerbi-type';
  /** @hidden */
  static type = "Report";

  public bookmarksManager: BookmarksManager;

  /**
   * Creates an instance of a Power BI Report.
   *
   * @param {Service} service
   * @param {HTMLElement} element
   * @param {IEmbedConfiguration} config
   * @hidden
   */
  constructor(service: Service, element: HTMLElement, baseConfig: IEmbedConfigurationBase, phasedRender?: boolean, isBootstrap?: boolean, iframe?: HTMLIFrameElement) {
    const config = baseConfig as IReportEmbedConfiguration;
    super(service, element, config, iframe, phasedRender, isBootstrap);
    this.loadPath = "/report/load";
    this.phasedLoadPath = "/report/prepare";
    Array.prototype.push.apply(this.allowedEvents, Report.allowedEvents);

    this.bookmarksManager = new BookmarksManager(service, config, this.iframe);

    service.router.post(`/reports/${this.config.uniqueId}/eventHooks/:eventName`, async (req, _res) => {
      switch (req.params.eventName) {
        case "preQuery":
          req.body = req.body || {};
          req.body.report = this;
          await service.invokeSDKHook(this.eventHooks?.applicationContextProvider, req, _res);
          break;

        case "newAccessToken":
          req.body = req.body || {};
          req.body.report = this;
          await service.invokeSDKHook(this.eventHooks?.accessTokenProvider, req, _res);
          break;

        default:
          assert(false, `${req.params.eventName} eventHook is not supported`);
          break;
      }
    });
  }

  /**
   * Adds backwards compatibility for the previous load configuration, which used the reportId query parameter to specify the report ID
   * (e.g. http://embedded.powerbi.com/appTokenReportEmbed?reportId=854846ed-2106-4dc2-bc58-eb77533bf2f1).
   *
   * By extracting the ID we can ensure that the ID is always explicitly provided as part of the load configuration.
   *
   * @hidden
   * @static
   * @param {string} url
   * @returns {string}
   */
  static findIdFromEmbedUrl(url: string): string {
    const reportIdRegEx = /reportId="?([^&]+)"?/;
    const reportIdMatch = url.match(reportIdRegEx);

    let reportId: string;
    if (reportIdMatch) {
      reportId = reportIdMatch[1];
    }

    return reportId;
  }

  /**
   * Render a preloaded report, using phased embedding API
   *
   * ```javascript
   * // Load report
   * var report = powerbi.load(element, config);
   *
   * ...
   *
   * // Render report
   * report.render()
   * ```
   *
   * @returns {Promise<void>}
   */
  async render(config?: IReportLoadConfiguration | IReportEmbedConfiguration): Promise<void> {
    try {
      const response = await this.service.hpm.post<void>(`/report/render`, config, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Add an empty page to the report
   *
   * ```javascript
   * // Add a page to the report with "Sales" as the page display name
   * report.addPage("Sales");
   * ```
   *
   * @returns {Promise<Page>}
   */
  async addPage(displayName?: string): Promise<Page> {
    const request = {
      displayName: displayName
    };

    try {
      const response = await this.service.hpm.post<IPage>(`/report/addPage`, request, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      const page = response.body;
      return new Page(this, page.name, page.displayName, page.isActive, page.visibility, page.defaultSize, page.defaultDisplayOption);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Delete a page from a report
   *
   * ```javascript
   * // Delete a page from a report by pageName (PageName is different than the display name and can be acquired from the getPages API)
   * report.deletePage("ReportSection145");
   * ```
   *
   * @returns {Promise<void>}
   */
  async deletePage(pageName: string): Promise<void> {
    try {
      const response = await this.service.hpm.delete<void>(`/report/pages/${pageName}`, {}, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Rename a page from a report
   *
   * ```javascript
   * // Rename a page from a report by changing displayName (pageName is different from the display name and can be acquired from the getPages API)
   * report.renamePage("ReportSection145", "Sales");
   * ```
   *
   * @returns {Promise<void>}
   */
  async renamePage(pageName: string, displayName: string): Promise<void> {
    const page: IPage = {
      name: pageName,
      displayName: displayName,
    };

    try {
      const response = await this.service.hpm.put<void>(`/report/pages/${pageName}/name`, page, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Gets filters that are applied at the report level.
   *
   * ```javascript
   * // Get filters applied at report level
   * report.getFilters()
   *   .then(filters => {
   *     ...
   *   });
   * ```
   *
   * @returns {Promise<IFilter[]>}
   */
  async getFilters(): Promise<IFilter[]> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    try {
      const response = await this.service.hpm.get<IFilter[]>(`/report/filters`, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Update the filters at the report level according to the operation: Add, replace all, replace by target or remove.
   *
   * ```javascript
   * report.updateFilters(FiltersOperations.Add, filters)
   *   .catch(errors => { ... });
   * ```
   *
   * @param {(IFilter[])} filters
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async updateFilters(operation: FiltersOperations, filters?: IFilter[]): Promise<IHttpPostMessageResponse<void>> {
    const updateFiltersRequest: IUpdateFiltersRequest = {
      filtersOperation: operation,
      filters: filters as ReportLevelFilters[]
    };

    try {
      return await this.service.hpm.post<void>(`/report/filters`, updateFiltersRequest, { uid: this.config.uniqueId }, this.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Removes all filters at the report level.
   *
   * ```javascript
   * report.removeFilters();
   * ```
   *
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async removeFilters(): Promise<IHttpPostMessageResponse<void>> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    return this.updateFilters(FiltersOperations.RemoveAll);
  }

  /**
   * Sets filters at the report level.
   *
   * ```javascript
   * const filters: [
   *    ...
   * ];
   *
   * report.setFilters(filters)
   *  .catch(errors => {
   *    ...
   *  });
   * ```
   *
   * @param {(IFilter[])} filters
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async setFilters(filters: IFilter[]): Promise<IHttpPostMessageResponse<void>> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    try {
      return await this.service.hpm.put<void>(`/report/filters`, filters, { uid: this.config.uniqueId }, this.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Gets the report ID from the first available location: options, attribute, embed url.
   *
   * @returns {string}
   */
  getId(): string {
    const config = this.config as IReportEmbedConfiguration;
    const reportId = config.id || this.element.getAttribute(Report.reportIdAttribute) || Report.findIdFromEmbedUrl(config.embedUrl);

    if (typeof reportId !== 'string' || reportId.length === 0) {
      throw new Error(`Report id is required, but it was not found. You must provide an id either as part of embed configuration or as attribute '${Report.reportIdAttribute}'.`);
    }

    return reportId;
  }

  /**
   * Gets the list of pages within the report.
   *
   * ```javascript
   * report.getPages()
   *  .then(pages => {
   *      ...
   *  });
   * ```
   *
   * @returns {Promise<Page[]>}
   */
  async getPages(): Promise<Page[]> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    try {
      const response = await this.service.hpm.get<IPage[]>('/report/pages', { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body
        .map((page) => new Page(this, page.name, page.displayName, page.isActive, page.visibility, page.defaultSize, page.defaultDisplayOption, page.mobileSize, page.background, page.wallpaper));
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Gets a report page by its name.
   *
   * ```javascript
   * report.getPageByName(pageName)
   *  .then(page => {
   *      ...
   *  });
   * ```
   *
   * @param {string} pageName
   * @returns {Promise<Page>}
   */
  async getPageByName(pageName: string): Promise<Page> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    try {
      const response = await this.service.hpm.get<IPage[]>(`/report/pages`, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      const page = response.body.find((p: IPage) => p.name === pageName);

      if (!page) {
        return Promise.reject(CommonErrorCodes.NotFound);
      }

      return new Page(
        this,
        page.name,
        page.displayName,
        page.isActive,
        page.visibility,
        page.defaultSize,
        page.defaultDisplayOption,
        page.mobileSize,
        page.background,
        page.wallpaper,
      );
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Gets the active report page.
   *
   * ```javascript
   * report.getActivePage()
   *  .then(activePage => {
   *      ...
   *  });
   * ```
   *
   * @returns {Promise<Page>}
   */
  async getActivePage(): Promise<Page> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }
    try {
      const response = await this.service.hpm.get<IPage[]>('/report/pages', { uid: this.config.uniqueId }, this.iframe.contentWindow);
      const activePage = response.body.find((page: IPage) => page.isActive);

      return new Page(
        this,
        activePage.name,
        activePage.displayName,
        activePage.isActive,
        activePage.visibility,
        activePage.defaultSize,
        activePage.defaultDisplayOption,
        activePage.mobileSize,
        activePage.background,
        activePage.wallpaper,
      );
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Creates an instance of a Page.
   *
   * Normally you would get Page objects by calling `report.getPages()`, but in the case
   * that the page name is known and you want to perform an action on a page without having to retrieve it
   * you can create it directly.
   *
   * Note: Because you are creating the page manually there is no guarantee that the page actually exists in the report, and subsequent requests could fail.
   *
   * @param {string} name
   * @param {string} [displayName]
   * @param {boolean} [isActive]
   * @returns {Page}
   * @hidden
   */
  page(name: string, displayName?: string, isActive?: boolean, visibility?: SectionVisibility): Page {
    return new Page(this, name, displayName, isActive, visibility);
  }

  /**
   * Prints the active page of the report by invoking `window.print()` on the embed iframe component.
   */
  async print(): Promise<void> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    try {
      const response = await this.service.hpm.post<void>('/report/print', null, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Sets the active page of the report.
   *
   * ```javascript
   * report.setPage("page2")
   *  .catch(error => { ... });
   * ```
   *
   * @param {string} pageName
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async setPage(pageName: string): Promise<IHttpPostMessageResponse<void>> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    const page: IPage = {
      name: pageName,
      displayName: null,
      isActive: true
    };

    try {
      return await this.service.hpm.put<void>('/report/pages/active', page, { uid: this.config.uniqueId }, this.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Updates visibility settings for the filter pane and the page navigation pane.
   *
   * ```javascript
   * const newSettings = {
   *   panes: {
   *     filters: {
   *       visible: false
   *     }
   *   }
   * };
   *
   * report.updateSettings(newSettings)
   *   .catch(error => { ... });
   * ```
   *
   * @param {ISettings} settings
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async updateSettings(settings: ISettings): Promise<IHttpPostMessageResponse<void>> {
    if (isRDLEmbed(this.config.embedUrl) && settings.customLayout != null) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    try {
      const response = await this.service.hpm.patch<void>('/report/settings', settings, { uid: this.config.uniqueId }, this.iframe.contentWindow);

      // Update commands if provided
      const extension = settings?.extensions as IExtensions;
      this.commands = extension?.commands ?? this.commands;
      this.groups = extension?.groups ?? this.groups;

      // Adding commands in extensions array to this.commands
      const extensionsArray = settings?.extensions as IExtension[];
      if (Array.isArray(extensionsArray)) {
        this.commands = [];
        extensionsArray.map((extensionElement: IExtension) => { if (extensionElement?.command) { this.commands.push(extensionElement.command); } });
      }

      return response;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Validate load configuration.
   *
   * @hidden
   */
  validate(config: IEmbedConfigurationBase): IError[] {
    if (isRDLEmbed(this.config.embedUrl)) {
      return validatePaginatedReportLoad(config);
    }
    return validateReportLoad(config);
  }

  /**
   * Handle config changes.
   *
   * @returns {void}
   */
  configChanged(isBootstrap: boolean): void {
    const config = this.config as IReportEmbedConfiguration;
    if (this.isMobileSettings(config.settings)) {
      config.embedUrl = addParamToUrl(config.embedUrl, "isMobile", "true");
    }

    // Calculate settings from HTML element attributes if available.
    const filterPaneEnabledAttribute = this.element.getAttribute(Report.filterPaneEnabledAttribute);
    const navContentPaneEnabledAttribute = this.element.getAttribute(Report.navContentPaneEnabledAttribute);

    const elementAttrSettings: IEmbedSettings = {
      filterPaneEnabled: (filterPaneEnabledAttribute == null) ? undefined : (filterPaneEnabledAttribute !== "false"),
      navContentPaneEnabled: (navContentPaneEnabledAttribute == null) ? undefined : (navContentPaneEnabledAttribute !== "false")
    };

    // Set the settings back into the config.
    this.config.settings = assign({}, elementAttrSettings, config.settings) as ISettings;

    if (isBootstrap) {
      return;
    }

    config.id = this.getId();
  }

  /**
   * @hidden
   * @returns {string}
   */
  getDefaultEmbedUrlEndpoint(): string {
    return "reportEmbed";
  }

  /**
   * Switch Report view mode.
   *
   * @returns {Promise<void>}
   */
  async switchMode(viewMode: ViewMode | string): Promise<void> {
    let newMode: string;
    if (typeof viewMode === "string") {
      newMode = viewMode;
    }
    else {
      newMode = this.viewModeToString(viewMode);
    }

    const url = '/report/switchMode/' + newMode;
    try {
      const response = await this.service.hpm.post<void>(url, null, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Refreshes data sources for the report.
   *
   * ```javascript
   * report.refresh();
   * ```
   */
  async refresh(): Promise<void> {
    try {
      const response = await this.service.hpm.post<void>('/report/refresh', null, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * checks if the report is saved.
   *
   * ```javascript
   * report.isSaved()
   * ```
   *
   * @returns {Promise<boolean>}
   */
  async isSaved(): Promise<boolean> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    return await isSavedInternal(this.service.hpm, this.config.uniqueId, this.iframe.contentWindow);
  }

  /**
   * Apply a theme to the report
   *
   * ```javascript
   * report.applyTheme(theme);
   * ```
   */
  async applyTheme(theme: IReportTheme): Promise<void> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    return await this.applyThemeInternal(theme);
  }

  /**
   * Reset and apply the default theme of the report
   *
   * ```javascript
   * report.resetTheme();
   * ```
   */
  async resetTheme(): Promise<void> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    return await this.applyThemeInternal(<IReportTheme>{});
  }

  /**
   * get the theme of the report
   *
   * ```javascript
   * report.getTheme();
   * ```
   */
  async getTheme(): Promise<IReportTheme> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    try {
      const response = await this.service.hpm.get<IReportTheme>(`/report/theme`, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Reset user's filters, slicers, and other data view changes to the default state of the report
   *
   * ```javascript
   * report.resetPersistentFilters();
   * ```
   */
  async resetPersistentFilters(): Promise<IHttpPostMessageResponse<void>> {
    try {
      return await this.service.hpm.delete<void>(`/report/userState`, null, { uid: this.config.uniqueId }, this.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Save user's filters, slicers, and other data view changes of the report
   *
   * ```javascript
   * report.savePersistentFilters();
   * ```
   */
  async savePersistentFilters(): Promise<IHttpPostMessageResponse<void>> {
    try {
      return await this.service.hpm.post<void>(`/report/userState`, null, { uid: this.config.uniqueId }, this.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Returns if there are user's filters, slicers, or other data view changes applied on the report.
   * If persistent filters is disable, returns false.
   *
   * ```javascript
   * report.arePersistentFiltersApplied();
   * ```
   *
   * @returns {Promise<boolean>}
   */
  async arePersistentFiltersApplied(): Promise<boolean> {
    try {
      const response = await this.service.hpm.get<boolean>(`/report/isUserStateApplied`, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Remove context menu extension command.
   *
   * ```javascript
   * report.removeContextMenuCommand(commandName, contextMenuTitle)
   *  .catch(error => {
   *      ...
   *  });
   * ```
   *
   * @param {string} commandName
   * @param {string} contextMenuTitle
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async removeContextMenuCommand(commandName: string, contextMenuTitle: string): Promise<IHttpPostMessageResponse<void>> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    const commandCopy = JSON.parse(JSON.stringify(this.commands)) as ICommandExtension[];
    const indexOfCommand: number = this.findCommandMenuIndex("visualContextMenu", commandCopy, commandName, contextMenuTitle);
    if (indexOfCommand === -1) {
      throw CommonErrorCodes.NotFound;
    }

    // Delete the context menu and not the entire command, since command can have option menu as well.
    delete commandCopy[indexOfCommand].extend.visualContextMenu;
    const newSetting: ISettings = {
      extensions: {
        commands: commandCopy,
        groups: this.groups
      }
    };
    return await this.updateSettings(newSetting);
  }

  /**
   * Add context menu extension command.
   *
   * ```javascript
   * report.addContextMenuCommand(commandName, commandTitle, contextMenuTitle, menuLocation, visualName, visualType, groupName)
   *  .catch(error => {
   *      ...
   *  });
   * ```
   *
   * @param {string} commandName
   * @param {string} commandTitle
   * @param {string} contextMenuTitle
   * @param {MenuLocation} menuLocation
   * @param {string} visualName
   * @param {string} visualType
   * @param {string} groupName
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async addContextMenuCommand(commandName: string, commandTitle: string, contextMenuTitle: string = commandTitle, menuLocation: MenuLocation = MenuLocation.Bottom, visualName: string = undefined, visualType: string, groupName: string = undefined): Promise<IHttpPostMessageResponse<void>> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    const newCommands: ICommandExtension[] = this.createMenuCommand("visualContextMenu", commandName, commandTitle, contextMenuTitle, menuLocation, visualName, visualType, groupName);
    const newSetting: ISettings = {
      extensions: {
        commands: newCommands,
        groups: this.groups
      }
    };
    return await this.updateSettings(newSetting);
  }

  /**
   * Remove options menu extension command.
   *
   * ```javascript
   * report.removeOptionsMenuCommand(commandName, optionsMenuTitle)
   *  .then({
   *      ...
   *  });
   * ```
   *
   * @param {string} commandName
   * @param {string} optionsMenuTitle
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async removeOptionsMenuCommand(commandName: string, optionsMenuTitle: string): Promise<IHttpPostMessageResponse<void>> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    const commandCopy = JSON.parse(JSON.stringify(this.commands)) as ICommandExtension[];
    const indexOfCommand: number = this.findCommandMenuIndex("visualOptionsMenu", commandCopy, commandName, optionsMenuTitle);

    if (indexOfCommand === -1) {
      throw CommonErrorCodes.NotFound;
    }

    // Delete the context options and not the entire command, since command can have context menu as well.
    delete commandCopy[indexOfCommand].extend.visualOptionsMenu;
    delete commandCopy[indexOfCommand].icon;
    const newSetting: ISettings = {
      extensions: {
        commands: commandCopy,
        groups: this.groups
      }
    };
    return await this.updateSettings(newSetting);
  }

  /**
   * Add options menu extension command.
   *
   * ```javascript
   * report.addOptionsMenuCommand(commandName, commandTitle, optionsMenuTitle, menuLocation, visualName, visualType, groupName, commandIcon)
   *  .catch(error => {
   *      ...
   *  });
   * ```
   *
   * @param {string} commandName
   * @param {string} commandTitle
   * @param {string} optionMenuTitle
   * @param {MenuLocation} menuLocation
   * @param {string} visualName
   * @param {string} visualType
   * @param {string} groupName
   * @param {string} commandIcon
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async addOptionsMenuCommand(commandName: string, commandTitle: string, optionsMenuTitle: string = commandTitle, menuLocation: MenuLocation = MenuLocation.Bottom, visualName: string = undefined, visualType: string = undefined, groupName: string = undefined, commandIcon: string = undefined): Promise<IHttpPostMessageResponse<void>> {
    if (isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    const newCommands: ICommandExtension[] = this.createMenuCommand("visualOptionsMenu", commandName, commandTitle, optionsMenuTitle, menuLocation, visualName, visualType, groupName, commandIcon);
    const newSetting: ISettings = {
      extensions: {
        commands: newCommands,
        groups: this.groups
      }
    };
    return await this.updateSettings(newSetting);
  }

  /**
   * Updates the display state of a visual in a page.
   *
   * ```javascript
   * report.setVisualDisplayState(pageName, visualName, displayState)
   *   .catch(error => { ... });
   * ```
   *
   * @param {string} pageName
   * @param {string} visualName
   * @param {VisualContainerDisplayMode} displayState
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async setVisualDisplayState(pageName: string, visualName: string, displayState: VisualContainerDisplayMode): Promise<IHttpPostMessageResponse<void>> {
    // Check if page name and visual name are valid
    await this.validateVisual(pageName, visualName);
    const visualLayout: IVisualLayout = {
      displayState: {
        mode: displayState
      }
    };

    // Get new Settings object with updated visual layout
    const newSettings = this.buildLayoutSettingsObject(pageName, visualName, visualLayout);
    return this.updateSettings(newSettings);
  }

  /**
   * Resize a visual in a page.
   *
   * ```javascript
   * report.resizeVisual(pageName, visualName, width, height)
   *   .catch(error => { ... });
   * ```
   *
   * @param {string} pageName
   * @param {string} visualName
   * @param {number} width
   * @param {number} height
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async resizeVisual(pageName: string, visualName: string, width: number, height: number): Promise<IHttpPostMessageResponse<void>> {
    // Check if page name and visual name are valid
    await this.validateVisual(pageName, visualName);
    const visualLayout: IVisualLayout = {
      width: width,
      height: height,
    };

    // Get new Settings object with updated visual layout
    const newSettings = this.buildLayoutSettingsObject(pageName, visualName, visualLayout);
    return this.updateSettings(newSettings);
  }

  /**
   * Updates the size of active page in report.
   *
   * ```javascript
   * report.resizeActivePage(pageSizeType, width, height)
   *   .catch(error => { ... });
   * ```
   *
   * @param {PageSizeType} pageSizeType
   * @param {number} width
   * @param {number} height
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async resizeActivePage(pageSizeType: PageSizeType, width?: number, height?: number): Promise<IHttpPostMessageResponse<void>> {
    const pageSize: ICustomPageSize = {
      type: pageSizeType,
      width: width,
      height: height
    };

    // Create new settings object with custom layout type
    const newSettings: ISettings = {
      layoutType: LayoutType.Custom,
      customLayout: {
        pageSize: pageSize
      }
    };
    return this.updateSettings(newSettings);
  }

  /**
   * Updates the position of a visual in a page.
   *
   * ```javascript
   * report.moveVisual(pageName, visualName, x, y, z)
   *   .catch(error => { ... });
   * ```
   *
   * @param {string} pageName
   * @param {string} visualName
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async moveVisual(pageName: string, visualName: string, x: number, y: number, z?: number): Promise<IHttpPostMessageResponse<void>> {
    // Check if page name and visual name are valid
    await this.validateVisual(pageName, visualName);
    const visualLayout: IVisualLayout = {
      x: x,
      y: y,
      z: z
    };

    // Get new Settings object with updated visual layout
    const newSettings = this.buildLayoutSettingsObject(pageName, visualName, visualLayout);
    return this.updateSettings(newSettings);
  }

  /**
   * Updates the report layout
   *
   * ```javascript
   * report.switchLayout(layoutType);
   * ```
   *
   * @param {LayoutType} layoutType
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async switchLayout(layoutType: LayoutType): Promise<IHttpPostMessageResponse<void>> {
    const isInitialMobileSettings = this.isMobileSettings({ layoutType: this.initialLayoutType });
    const isPassedMobileSettings = this.isMobileSettings({ layoutType: layoutType });

    // Check if both passed layout and initial layout are of same type.
    if (isInitialMobileSettings !== isPassedMobileSettings) {
      throw "Switching between mobile and desktop layouts is not supported. Please reset the embed container and re-embed with required layout.";
    }

    const newSetting: ISettings = {
      layoutType: layoutType
    };
    const response = await this.updateSettings(newSetting);
    this.initialLayoutType = layoutType;
    return response;
  }

  /**
   * @hidden
   */
  private createMenuCommand(type: string, commandName: string, commandTitle: string, menuTitle: string, menuLocation: MenuLocation, visualName: string, visualType: string, groupName: string, icon?: string): ICommandExtension[] {
    const newCommandObj: ICommandExtension = {
      name: commandName,
      title: commandTitle,
      extend: {
      }
    };

    newCommandObj.extend[type] = {
      title: menuTitle,
      menuLocation: menuLocation,
    };
    if (type === "visualOptionsMenu") {
      newCommandObj.icon = icon;
    }
    if (groupName) {
      const extend = newCommandObj.extend[type] as IFlatMenuExtension;
      delete extend.menuLocation;
      const groupExtend = newCommandObj.extend[type] as IGroupedMenuExtension;
      groupExtend.groupName = groupName;
    }
    if (visualName) {
      newCommandObj.selector = {
        $schema: "http://powerbi.com/product/schema#visualSelector",
        visualName: visualName
      };
    }
    if (visualType) {
      newCommandObj.selector = {
        $schema: "http://powerbi.com/product/schema#visualTypeSelector",
        visualType: visualType
      };
    }
    return [...this.commands, newCommandObj];
  }

  /**
   * @hidden
   */
  private findCommandMenuIndex(type: string, commands: ICommandExtension[], commandName: string, menuTitle: string): number {
    let indexOfCommand = -1;
    commands.some((activeMenuCommand, index) =>
      (activeMenuCommand.name === commandName && activeMenuCommand.extend[type] && activeMenuCommand.extend[type].title === menuTitle) ? (indexOfCommand = index, true) : false);
    return indexOfCommand;
  }

  /**
   * @hidden
   */
  private buildLayoutSettingsObject(pageName: string, visualName: string, visualLayout: IVisualLayout): ISettings {
    // Create new settings object with custom layout type
    const newSettings: ISettings = {
      layoutType: LayoutType.Custom,
      customLayout: {
        pagesLayout: {}
      }
    };
    newSettings.customLayout.pagesLayout[pageName] = {
      visualsLayout: {}
    };
    newSettings.customLayout.pagesLayout[pageName].visualsLayout[visualName] = visualLayout;
    return newSettings;
  }

  /**
   * @hidden
   */
  private async validateVisual(pageName: string, visualName: string): Promise<VisualDescriptor> {
    const page = await this.getPageByName(pageName);
    return await page.getVisualByName(visualName);
  }

  /**
   * @hidden
   */
  private async applyThemeInternal(theme: IReportTheme): Promise<void> {
    try {
      const response = await this.service.hpm.put<void>('/report/theme', theme, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * @hidden
   */
  private viewModeToString(viewMode: ViewMode): string {
    let mode: string;
    switch (viewMode) {
      case ViewMode.Edit:
        mode = "edit";
        break;
      case ViewMode.View:
        mode = "view";
        break;
    }

    return mode;
  }

  /**
   * @hidden
   */
  private isMobileSettings(settings: IEmbedSettings): boolean {
    return settings && (settings.layoutType === LayoutType.MobileLandscape || settings.layoutType === LayoutType.MobilePortrait);
  }

  /**
   * Return the current zoom level of the report.
   *
   * @returns {Promise<number>}
   */
  async getZoom(): Promise<number> {
    try {
      const response = await this.service.hpm.get<number>(`/report/zoom`, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Sets the report's zoom level.
   *
   * @param zoomLevel zoom level to set
   */
  async setZoom(zoomLevel: number): Promise<void> {
    await this.updateSettings({ zoomLevel: zoomLevel });
  }
}
