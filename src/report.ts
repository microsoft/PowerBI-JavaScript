import * as service from './service';
import * as embed from './embed';
import * as models from 'powerbi-models';
import * as utils from './util';
import * as errors from './errors';
import { IFilterable } from './ifilterable';
import { Page } from './page';
import { IReportLoadConfiguration, IReportEmbedConfiguration } from 'powerbi-models';
import { BookmarksManager } from './bookmarksManager';
import { IHttpPostMessageResponse } from 'http-post-message';

/**
 * A Report node within a report hierarchy
 *
 * @export
 * @interface IReportNode
 */
export interface IReportNode {
  iframe: HTMLIFrameElement;
  service: service.IService;
  config: embed.IEmbedConfiguration | IReportEmbedConfiguration
}

/**
 * The Power BI Report embed component
 *
 * @export
 * @class Report
 * @extends {embed.Embed}
 * @implements {IReportNode}
 * @implements {IFilterable}
 */
export class Report extends embed.Embed implements IReportNode, IFilterable {
  /** @hidden */
  static allowedEvents = ["filtersApplied", "pageChanged", "commandTriggered", "swipeStart", "swipeEnd", "bookmarkApplied", "dataHyperlinkClicked", "visualRendered", "visualClicked", "selectionChanged"];
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
   * @param {service.Service} service
   * @param {HTMLElement} element
   * @param {embed.IEmbedConfiguration} config
   * @hidden
   */
  constructor(service: service.Service, element: HTMLElement, baseConfig: embed.IEmbedConfigurationBase, phasedRender?: boolean, isBootstrap?: boolean, iframe?: HTMLIFrameElement) {
    const config = <embed.IReportEmbedConfiguration>baseConfig;
    super(service, element, config, iframe, phasedRender, isBootstrap);
    this.loadPath = "/report/load";
    this.phasedLoadPath = "/report/prepare";
    Array.prototype.push.apply(this.allowedEvents, Report.allowedEvents);

    this.bookmarksManager = new BookmarksManager(service, config, this.iframe);
  }

  /**
   * Adds backwards compatibility for the previous load configuration, which used the reportId query parameter to specify the report ID
   * (e.g. http://embedded.powerbi.com/appTokenReportEmbed?reportId=854846ed-2106-4dc2-bc58-eb77533bf2f1).
   *
   * By extracting the ID we can ensure that the ID is always explicitly provided as part of the load configuration.
   * @hidden
   * @static
   * @param {string} url
   * @returns {string}
   */
  static findIdFromEmbedUrl(url: string): string {
    const reportIdRegEx = /reportId="?([^&]+)"?/
    const reportIdMatch = url.match(reportIdRegEx);

    let reportId;
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
  async render(config?: IReportLoadConfiguration | embed.IReportEmbedConfiguration): Promise<void> {
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
    var request = {
      displayName: displayName
    };

    try {
      const response = await this.service.hpm.post<models.IPage>(`/report/addPage`, request, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      var page = response.body;
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
    const page: models.IPage = {
      name: pageName,
      displayName,
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
   * @returns {Promise<models.IFilter[]>}
   */
  async getFilters(): Promise<models.IFilter[]> {
    if (utils.isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(errors.APINotSupportedForRDLError);
    }

    try {
      const response = await this.service.hpm.get<models.IFilter[]>(`/report/filters`, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body;
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
    let config = <embed.IReportEmbedConfiguration>this.config;
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
    if (utils.isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(errors.APINotSupportedForRDLError);
    }

    try {
      const response = await this.service.hpm.get<models.IPage[]>('/report/pages', { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body
        .map(page => {
          return new Page(this, page.name, page.displayName, page.isActive, page.visibility, page.defaultSize, page.defaultDisplayOption);
        });
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
  page(name: string, displayName?: string, isActive?: boolean, visibility?: models.SectionVisibility): Page {
    return new Page(this, name, displayName, isActive, visibility);
  }

  /**
   * Prints the active page of the report by invoking `window.print()` on the embed iframe component.
   */
  async print(): Promise<void> {
    if (utils.isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(errors.APINotSupportedForRDLError);
    }

    try {
      const response = await this.service.hpm.post<void>('/report/print', null, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body;
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
    if (utils.isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(errors.APINotSupportedForRDLError);
    }

    return await this.setFilters([]);
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
    if (utils.isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(errors.APINotSupportedForRDLError);
    }

    const page: models.IPage = {
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
   * @param {(models.IFilter[])} filters
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async setFilters(filters: models.IFilter[]): Promise<IHttpPostMessageResponse<void>> {
    if (utils.isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(errors.APINotSupportedForRDLError);
    }

    try {
      return await this.service.hpm.put<void>(`/report/filters`, filters, { uid: this.config.uniqueId }, this.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Updates visibility settings for the filter pane and the page navigation pane.
   *
   * ```javascript
   * const newSettings = {
   *   navContentPaneEnabled: true,
   *   filterPaneEnabled: false
   * };
   *
   * report.updateSettings(newSettings)
   *   .catch(error => { ... });
   * ```
   *
   * @param {models.ISettings} settings
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async updateSettings(settings: models.ISettings): Promise<IHttpPostMessageResponse<void>> {
    if (utils.isRDLEmbed(this.config.embedUrl) && settings.customLayout != null) {
      return Promise.reject(errors.APINotSupportedForRDLError);
    }

    try {
      return await this.service.hpm.patch<void>('/report/settings', settings, { uid: this.config.uniqueId }, this.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Validate load configuration.
   * 
   * @hidden
   */
  validate(config: embed.IEmbedConfigurationBase): models.IError[] {
    return models.validateReportLoad(config);
  }

  /**
   * Handle config changes.
   *
   * @returns {void}
   */
  configChanged(isBootstrap: boolean): void {
    let config = <embed.IReportEmbedConfiguration>this.config;

    if (this.isMobileSettings(config.settings))
      config.embedUrl = utils.addParamToUrl(config.embedUrl, "isMobile", "true");

    // Calculate settings from HTML element attributes if available.
    let filterPaneEnabledAttribute = this.element.getAttribute(Report.filterPaneEnabledAttribute);
    let navContentPaneEnabledAttribute = this.element.getAttribute(Report.navContentPaneEnabledAttribute);

    let elementAttrSettings: embed.IEmbedSettings = {
      filterPaneEnabled: (filterPaneEnabledAttribute == null) ? undefined : (filterPaneEnabledAttribute !== "false"),
      navContentPaneEnabled: (navContentPaneEnabledAttribute == null) ? undefined : (navContentPaneEnabledAttribute !== "false")
    };

    // Set the settings back into the config.
    this.config.settings = utils.assign({}, elementAttrSettings, config.settings);

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
  async switchMode(viewMode: models.ViewMode | string): Promise<void> {
    let newMode: string;
    if (typeof viewMode === "string") {
      newMode = viewMode;
    }
    else {
      newMode = this.viewModeToString(viewMode);
    }

    let url = '/report/switchMode/' + newMode;
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
    if (utils.isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(errors.APINotSupportedForRDLError);
    }

    return await utils.isSavedInternal(this.service.hpm, this.config.uniqueId, this.iframe.contentWindow);
  }

  /**
   * Apply a theme to the report
   *
   * ```javascript
   * report.applyTheme(theme);
   * ```
   */
  async applyTheme(theme: models.IReportTheme): Promise<void> {
    if (utils.isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(errors.APINotSupportedForRDLError);
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
    if (utils.isRDLEmbed(this.config.embedUrl)) {
      return Promise.reject(errors.APINotSupportedForRDLError);
    }

    return await this.applyThemeInternal(<models.IReportTheme>{});
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
   * @hidden
   */
  private async applyThemeInternal(theme: models.IReportTheme): Promise<void> {
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
  private viewModeToString(viewMode: models.ViewMode): string {
    let mode: string;
    switch (viewMode) {
      case models.ViewMode.Edit:
        mode = "edit";
        break;
      case models.ViewMode.View:
        mode = "view";
        break;
    }

    return mode;
  }

  /**
   * @hidden
   */
  private isMobileSettings(settings: embed.IEmbedSettings): boolean {
    return settings && (settings.layoutType === models.LayoutType.MobileLandscape || settings.layoutType === models.LayoutType.MobilePortrait);
  }
}
