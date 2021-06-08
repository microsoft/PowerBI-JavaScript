// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ExportDataType,
  FiltersOperations,
  ICloneVisualRequest,
  ICloneVisualResponse,
  IExportDataRequest,
  IExportDataResult,
  IFilter,
  ISlicerState,
  ISortByVisualRequest,
  IUpdateFiltersRequest,
  IVisualLayout,
  VisualContainerDisplayMode,
  VisualLevelFilters
} from 'powerbi-models';
import { IHttpPostMessageResponse } from 'http-post-message';
import { IFilterable } from './ifilterable';
import { IPageNode } from './page';
import { Report } from './report';

/**
 * A Visual node within a report hierarchy
 *
 * @export
 * @interface IVisualNode
 */
export interface IVisualNode {
  name: string;
  title: string;
  type: string;
  layout: IVisualLayout;
  page: IPageNode;
}

/**
 * A Power BI visual within a page
 *
 * @export
 * @class VisualDescriptor
 * @implements {IVisualNode}
 */
export class VisualDescriptor implements IVisualNode, IFilterable {
  /**
   * The visual name
   *
   * @type {string}
   */
  name: string;

  /**
   * The visual title
   *
   * @type {string}
   */
  title: string;

  /**
   * The visual type
   *
   * @type {string}
   */
  type: string;

  /**
   * The visual layout: position, size and visibility.
   *
   * @type {string}
   */
  layout: IVisualLayout;

  /**
   * The parent Power BI page that contains this visual
   *
   * @type {IPageNode}
   */
  page: IPageNode;

  /**
   * @hidden
   */
  constructor(page: IPageNode, name: string, title: string, type: string, layout: IVisualLayout) {
    this.name = name;
    this.title = title;
    this.type = type;
    this.layout = layout;
    this.page = page;
  }

  /**
   * Gets all visual level filters of the current visual.
   *
   * ```javascript
   * visual.getFilters()
   *  .then(filters => { ... });
   * ```
   *
   * @returns {(Promise<IFilter[]>)}
   */
  async getFilters(): Promise<IFilter[]> {
    try {
      const response = await this.page.report.service.hpm.get<IFilter[]>(`/report/pages/${this.page.name}/visuals/${this.name}/filters`, { uid: this.page.report.config.uniqueId }, this.page.report.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Update the filters for the current visual according to the operation: Add, replace all, replace by target or remove.
   *
   * ```javascript
   * visual.updateFilters(FiltersOperations.Add, filters)
   *   .catch(errors => { ... });
   * ```
   *
   * @param {(IFilter[])} filters
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async updateFilters(operation: FiltersOperations, filters?: IFilter[]): Promise<IHttpPostMessageResponse<void>> {
    const updateFiltersRequest: IUpdateFiltersRequest = {
      filtersOperation: operation,
      filters: filters as VisualLevelFilters[]
    };

    try {
      return await this.page.report.service.hpm.post<void>(`/report/pages/${this.page.name}/visuals/${this.name}/filters`, updateFiltersRequest, { uid: this.page.report.config.uniqueId }, this.page.report.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Removes all filters from the current visual.
   *
   * ```javascript
   * visual.removeFilters();
   * ```
   *
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async removeFilters(): Promise<IHttpPostMessageResponse<void>> {
    return await this.updateFilters(FiltersOperations.RemoveAll);
  }

  /**
   * Sets the filters on the current visual to 'filters'.
   *
   * ```javascript
   * visual.setFilters(filters);
   *   .catch(errors => { ... });
   * ```
   *
   * @param {(IFilter[])} filters
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async setFilters(filters: IFilter[]): Promise<IHttpPostMessageResponse<void>> {
    try {
      return await this.page.report.service.hpm.put<void>(`/report/pages/${this.page.name}/visuals/${this.name}/filters`, filters, { uid: this.page.report.config.uniqueId }, this.page.report.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Exports Visual data.
   * Can export up to 30K rows.
   *
   * @param rows: Optional. Default value is 30K, maximum value is 30K as well.
   * @param exportDataType: Optional. Default is ExportDataType.Summarized.
   * ```javascript
   * visual.exportData()
   *  .then(data => { ... });
   * ```
   *
   * @returns {(Promise<IExportDataResult>)}
   */
  async exportData(exportDataType?: ExportDataType, rows?: number): Promise<IExportDataResult> {
    const exportDataRequestBody: IExportDataRequest = {
      rows: rows,
      exportDataType: exportDataType
    };

    try {
      const response = await this.page.report.service.hpm.post<IExportDataResult>(`/report/pages/${this.page.name}/visuals/${this.name}/exportData`, exportDataRequestBody, { uid: this.page.report.config.uniqueId }, this.page.report.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Set slicer state.
   * Works only for visuals of type slicer.
   *
   * @param state: A new state which contains the slicer filters.
   * ```javascript
   * visual.setSlicerState()
   *  .then(() => { ... });
   * ```
   */
  async setSlicerState(state: ISlicerState): Promise<IHttpPostMessageResponse<void>> {
    try {
      return await this.page.report.service.hpm.put<void>(`/report/pages/${this.page.name}/visuals/${this.name}/slicer`, state, { uid: this.page.report.config.uniqueId }, this.page.report.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Get slicer state.
   * Works only for visuals of type slicer.
   *
   * ```javascript
   * visual.getSlicerState()
   *  .then(state => { ... });
   * ```
   *
   * @returns {(Promise<ISlicerState>)}
   */
  async getSlicerState(): Promise<ISlicerState> {
    try {
      const response = await this.page.report.service.hpm.get<ISlicerState>(`/report/pages/${this.page.name}/visuals/${this.name}/slicer`, { uid: this.page.report.config.uniqueId }, this.page.report.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Clone existing visual to a new instance.
   *
   * @returns {(Promise<ICloneVisualResponse>)}
   */
  async clone(request: ICloneVisualRequest = {}): Promise<ICloneVisualResponse> {
    try {
      const response = await this.page.report.service.hpm.post<ICloneVisualResponse>(`/report/pages/${this.page.name}/visuals/${this.name}/clone`, request, { uid: this.page.report.config.uniqueId }, this.page.report.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Sort a visual by dataField and direction.
   *
   * @param request: Sort by visual request.
   *
   * ```javascript
   * visual.sortBy(request)
   *  .then(() => { ... });
   * ```
   */
  async sortBy(request: ISortByVisualRequest): Promise<IHttpPostMessageResponse<void>> {
    try {
      return await this.page.report.service.hpm.put<void>(`/report/pages/${this.page.name}/visuals/${this.name}/sortBy`, request, { uid: this.page.report.config.uniqueId }, this.page.report.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Updates the position of a visual.
   *
   * ```javascript
   * visual.moveVisual(x, y, z)
   *   .catch(error => { ... });
   * ```
   *
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async moveVisual(x: number, y: number, z?: number): Promise<IHttpPostMessageResponse<void>> {
    const pageName = this.page.name;
    const visualName = this.name;
    const report = this.page.report as Report;
    return report.moveVisual(pageName, visualName, x, y, z);
  }

  /**
   * Updates the display state of a visual.
   *
   * ```javascript
   * visual.setVisualDisplayState(displayState)
   *   .catch(error => { ... });
   * ```
   *
   * @param {VisualContainerDisplayMode} displayState
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async setVisualDisplayState(displayState: VisualContainerDisplayMode): Promise<IHttpPostMessageResponse<void>> {
    const pageName = this.page.name;
    const visualName = this.name;
    const report = this.page.report as Report;

    return report.setVisualDisplayState(pageName, visualName, displayState);
  }

  /**
   * Resize a visual.
   *
   * ```javascript
   * visual.resizeVisual(width, height)
   *   .catch(error => { ... });
   * ```
   *
   * @param {number} width
   * @param {number} height
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async resizeVisual(width: number, height: number): Promise<IHttpPostMessageResponse<void>> {
    const pageName = this.page.name;
    const visualName = this.name;
    const report = this.page.report as Report;

    return report.resizeVisual(pageName, visualName, width, height);
  }
}
