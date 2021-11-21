// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHttpPostMessageResponse } from 'http-post-message';
import {
  CommonErrorCodes,
  DisplayOption,
  FiltersOperations,
  ICustomPageSize,
  IFilter,
  IPage,
  IUpdateFiltersRequest,
  IVisual,
  LayoutType,
  PageLevelFilters,
  PageSizeType,
  SectionVisibility,
  VisualContainerDisplayMode,
  IPageBackground,
  IPageWallpaper,
} from 'powerbi-models';
import { IFilterable } from './ifilterable';
import { IReportNode, Report } from './report';
import { VisualDescriptor } from './visualDescriptor';
import { isRDLEmbed } from './util';
import { APINotSupportedForRDLError } from './errors';

/**
 * A Page node within a report hierarchy
 *
 * @export
 * @interface IPageNode
 */
export interface IPageNode {
  report: IReportNode;
  name: string;
}

/**
 * A Power BI report page
 *
 * @export
 * @class Page
 * @implements {IPageNode}
 * @implements {IFilterable}
 */
export class Page implements IPageNode, IFilterable {
  /**
   * The parent Power BI report that this page is a member of
   *
   * @type {IReportNode}
   */
  report: IReportNode;
  /**
   * The report page name
   *
   * @type {string}
   */
  name: string;

  /**
   * The user defined display name of the report page, which is undefined if the page is created manually
   *
   * @type {string}
   */
  displayName: string;

  /**
   * Is this page is the active page
   *
   * @type {boolean}
   */
  isActive: boolean;

  /**
   * The visibility of the page.
   * 0 - Always Visible
   * 1 - Hidden in View Mode
   *
   * @type {SectionVisibility}
   */
  visibility: SectionVisibility;

  /**
   * Page size as saved in the report.
   *
   * @type {ICustomPageSize}
   */
  defaultSize: ICustomPageSize;

  /**
   * Mobile view page size (if defined) as saved in the report.
   *
   * @type {ICustomPageSize}
   */
  mobileSize: ICustomPageSize;

  /**
   * Page display options as saved in the report.
   *
   * @type {ICustomPageSize}
   */
  defaultDisplayOption: DisplayOption;

  /**
   * Page background color.
   *
   * @type {IPageBackground}
   */
  background: IPageBackground;

  /**
   * Page wallpaper color.
   *
   * @type {IPageWallpaper}
   */
  wallpaper: IPageWallpaper;

  /**
   * Creates an instance of a Power BI report page.
   *
   * @param {IReportNode} report
   * @param {string} name
   * @param {string} [displayName]
   * @param {boolean} [isActivePage]
   * @param {SectionVisibility} [visibility]
   * @hidden
   */
  constructor(report: IReportNode, name: string, displayName?: string, isActivePage?: boolean, visibility?: SectionVisibility, defaultSize?: ICustomPageSize, defaultDisplayOption?: DisplayOption, mobileSize?: ICustomPageSize, background?: IPageBackground, wallpaper?: IPageWallpaper) {
    this.report = report;
    this.name = name;
    this.displayName = displayName;
    this.isActive = isActivePage;
    this.visibility = visibility;
    this.defaultSize = defaultSize;
    this.mobileSize = mobileSize;
    this.defaultDisplayOption = defaultDisplayOption;
    this.background = background;
    this.wallpaper = wallpaper;
  }

  /**
   * Gets all page level filters within the report.
   *
   * ```javascript
   * page.getFilters()
   *  .then(filters => { ... });
   * ```
   *
   * @returns {(Promise<IFilter[]>)}
   */
  async getFilters(): Promise<IFilter[]> {
    try {
      const response = await this.report.service.hpm.get<IFilter[]>(`/report/pages/${this.name}/filters`, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Update the filters for the current page according to the operation: Add, replace all, replace by target or remove.
   *
   * ```javascript
   * page.updateFilters(FiltersOperations.Add, filters)
   *   .catch(errors => { ... });
   * ```
   *
   * @param {(IFilter[])} filters
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async updateFilters(operation: FiltersOperations, filters?: IFilter[]): Promise<IHttpPostMessageResponse<void>> {
    const updateFiltersRequest: IUpdateFiltersRequest = {
      filtersOperation: operation,
      filters: filters as PageLevelFilters[]
    };

    try {
      return await this.report.service.hpm.post<void>(`/report/pages/${this.name}/filters`, updateFiltersRequest, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Removes all filters from this page of the report.
   *
   * ```javascript
   * page.removeFilters();
   * ```
   *
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async removeFilters(): Promise<IHttpPostMessageResponse<void>> {
    return await this.updateFilters(FiltersOperations.RemoveAll);
  }

  /**
   * Sets all filters on the current page.
   *
   * ```javascript
   * page.setFilters(filters)
   *   .catch(errors => { ... });
   * ```
   *
   * @param {(IFilter[])} filters
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async setFilters(filters: IFilter[]): Promise<IHttpPostMessageResponse<void>> {
    try {
      return await this.report.service.hpm.put<void>(`/report/pages/${this.name}/filters`, filters, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Delete the page from the report
   *
   * ```javascript
   * // Delete the page from the report
   * page.delete();
   * ```
   *
   * @returns {Promise<void>}
   */
  async delete(): Promise<void> {
    try {
      const response = await this.report.service.hpm.delete<void>(`/report/pages/${this.name}`, {}, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Makes the current page the active page of the report.
   *
   * ```javascript
   * page.setActive();
   * ```
   *
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async setActive(): Promise<IHttpPostMessageResponse<void>> {
    const page: IPage = {
      name: this.name,
      displayName: null,
      isActive: true
    };

    try {
      return await this.report.service.hpm.put<void>('/report/pages/active', page, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Set displayName to the current page.
   *
   * ```javascript
   * page.setName(displayName);
   * ```
   *
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async setDisplayName(displayName: string): Promise<IHttpPostMessageResponse<void>> {
    const page: IPage = {
      name: this.name,
      displayName: displayName,
    };

    try {
      return await this.report.service.hpm.put<void>(`/report/pages/${this.name}/name`, page, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Gets all the visuals on the page.
   *
   * ```javascript
   * page.getVisuals()
   *   .then(visuals => { ... });
   * ```
   *
   * @returns {Promise<VisualDescriptor[]>}
   */
  async getVisuals(): Promise<VisualDescriptor[]> {
    if (isRDLEmbed(this.report.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    try {
      const response = await this.report.service.hpm.get<IVisual[]>(`/report/pages/${this.name}/visuals`, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow);
      return response.body
        .map((visual) => new VisualDescriptor(this, visual.name, visual.title, visual.type, visual.layout));
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Gets a visual by name on the page.
   *
   * ```javascript
   * page.getVisualByName(visualName: string)
   *  .then(visual => {
   *      ...
   *  });
   * ```
   *
   * @param {string} visualName
   * @returns {Promise<VisualDescriptor>}
   */
  async getVisualByName(visualName: string): Promise<VisualDescriptor> {
    if (isRDLEmbed(this.report.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    try {
      const response = await this.report.service.hpm.get<IVisual[]>(`/report/pages/${this.name}/visuals`, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow);
      const visual = response.body.find((v: IVisual) => v.name === visualName);
      if (!visual) {
        return Promise.reject(CommonErrorCodes.NotFound);
      }

      return new VisualDescriptor(this, visual.name, visual.title, visual.type, visual.layout);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Updates the display state of a visual in a page.
   *
   * ```javascript
   * page.setVisualDisplayState(visualName, displayState)
   *   .catch(error => { ... });
   * ```
   *
   * @param {string} visualName
   * @param {VisualContainerDisplayMode} displayState
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async setVisualDisplayState(visualName: string, displayState: VisualContainerDisplayMode): Promise<IHttpPostMessageResponse<void>> {
    const pageName = this.name;
    const report = this.report as Report;
    return report.setVisualDisplayState(pageName, visualName, displayState);
  }

  /**
   * Updates the position of a visual in a page.
   *
   * ```javascript
   * page.moveVisual(visualName, x, y, z)
   *   .catch(error => { ... });
   * ```
   *
   * @param {string} visualName
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async moveVisual(visualName: string, x: number, y: number, z?: number): Promise<IHttpPostMessageResponse<void>> {
    const pageName = this.name;
    const report = this.report as Report;
    return report.moveVisual(pageName, visualName, x, y, z);
  }

  /**
   * Resize a visual in a page.
   *
   * ```javascript
   * page.resizeVisual(visualName, width, height)
   *   .catch(error => { ... });
   * ```
   *
   * @param {string} visualName
   * @param {number} width
   * @param {number} height
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async resizeVisual(visualName: string, width: number, height: number): Promise<IHttpPostMessageResponse<void>> {
    const pageName = this.name;
    const report = this.report as Report;
    return report.resizeVisual(pageName, visualName, width, height);
  }

  /**
   * Updates the size of active page.
   *
   * ```javascript
   * page.resizePage(pageSizeType, width, height)
   *   .catch(error => { ... });
   * ```
   *
   * @param {PageSizeType} pageSizeType
   * @param {number} width
   * @param {number} height
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async resizePage(pageSizeType: PageSizeType, width?: number, height?: number): Promise<IHttpPostMessageResponse<void>> {
    if (!this.isActive) {
      return Promise.reject('Cannot resize the page. Only the active page can be resized');
    }
    const report = this.report as Report;
    return report.resizeActivePage(pageSizeType, width, height);
  }

  /**
   * Gets the list of slicer visuals on the page.
   *
   * ```javascript
   * page.getSlicers()
   *  .then(slicers => {
   *      ...
   *  });
   * ```
   *
   * @returns {Promise<IVisual[]>}
   */
  async getSlicers(): Promise<IVisual[]> {
    if (isRDLEmbed(this.report.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    try {
      const response = await this.report.service.hpm.get<IVisual[]>(`/report/pages/${this.name}/visuals`, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow);
      return response.body
        .filter((visual: IVisual) => visual.type === 'slicer')
        .map((visual: IVisual) => new VisualDescriptor(this, visual.name, visual.title, visual.type, visual.layout));
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Checks if page has layout.
   *
   * ```javascript
   * page.hasLayout(layoutType)
   *  .then(hasLayout: boolean => { ... });
   * ```
   *
   * @returns {(Promise<boolean>)}
   */
  async hasLayout(layoutType: LayoutType): Promise<boolean> {
    if (isRDLEmbed(this.report.config.embedUrl)) {
      return Promise.reject(APINotSupportedForRDLError);
    }

    const layoutTypeEnum = LayoutType[layoutType];
    try {
      const response = await this.report.service.hpm.get<boolean>(`/report/pages/${this.name}/layoutTypes/${layoutTypeEnum}`, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }
}
