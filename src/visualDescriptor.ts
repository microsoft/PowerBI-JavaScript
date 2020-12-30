import * as models from 'powerbi-models';
import { IFilterable } from './ifilterable';
import { IPageNode } from './page';
import { IHttpPostMessageResponse } from 'http-post-message';

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
  layout: models.IVisualLayout;
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
  layout: models.IVisualLayout;

  /**
   * The parent Power BI page that contains this visual
   *
   * @type {IPageNode}
   */
  page: IPageNode;

  /**
   * @hidden
   */
  constructor(page: IPageNode, name: string, title: string, type: string, layout: models.IVisualLayout) {
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
   * @returns {(Promise<models.IFilter[]>)}
   */
  async getFilters(): Promise<models.IFilter[]> {
    try {
      const response = await this.page.report.service.hpm.get<models.IFilter[]>(`/report/pages/${this.page.name}/visuals/${this.name}/filters`, { uid: this.page.report.config.uniqueId }, this.page.report.iframe.contentWindow);
      return response.body;
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
    return await this.setFilters([]);
  }

  /**
   * Sets the filters on the current visual to 'filters'.
   *
   * ```javascript
   * visual.setFilters(filters);
   *   .catch(errors => { ... });
   * ```
   *
   * @param {(models.IFilter[])} filters
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async setFilters(filters: models.IFilter[]): Promise<IHttpPostMessageResponse<void>> {
    try {
      return await this.page.report.service.hpm.put<void>(`/report/pages/${this.page.name}/visuals/${this.name}/filters`, filters, { uid: this.page.report.config.uniqueId }, this.page.report.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Exports Visual data.
   * Can export up to 30K rows.
   * @param rows: Optional. Default value is 30K, maximum value is 30K as well.
   * @param exportDataType: Optional. Default is models.ExportDataType.Summarized.
   * ```javascript
   * visual.exportData()
   *  .then(data => { ... });
   * ```
   *
   * @returns {(Promise<models.IExportDataResult>)}
   */
  async exportData(exportDataType?: models.ExportDataType, rows?: number): Promise<models.IExportDataResult> {
    const exportDataRequestBody: models.IExportDataRequest = {
      rows: rows,
      exportDataType: exportDataType
    };

    try {
      const response = await this.page.report.service.hpm.post<models.IExportDataResult>(`/report/pages/${this.page.name}/visuals/${this.name}/exportData`, exportDataRequestBody, { uid: this.page.report.config.uniqueId }, this.page.report.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Set slicer state.
   * Works only for visuals of type slicer.
   * @param state: A new state which contains the slicer filters.
   * ```javascript
   * visual.setSlicerState()
   *  .then(() => { ... });
   * ```
   */
  async setSlicerState(state: models.ISlicerState): Promise<IHttpPostMessageResponse<void>> {
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
   * @returns {(Promise<models.ISlicerState>)}
   */
  async getSlicerState(): Promise<models.ISlicerState> {
    try {
      const response = await this.page.report.service.hpm.get<models.ISlicerState>(`/report/pages/${this.page.name}/visuals/${this.name}/slicer`, { uid: this.page.report.config.uniqueId }, this.page.report.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Clone existing visual to a new instance.
   *
   * @returns {(Promise<models.ICloneVisualResponse>)}
   */
  async clone(request: models.ICloneVisualRequest = {}): Promise<models.ICloneVisualResponse> {
    try {
      const response = await this.page.report.service.hpm.post<models.ICloneVisualResponse>(`/report/pages/${this.page.name}/visuals/${this.name}/clone`, request, { uid: this.page.report.config.uniqueId }, this.page.report.iframe.contentWindow);
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
  async sortBy(request: models.ISortByVisualRequest): Promise<IHttpPostMessageResponse<void>> {
    try {
      return await this.page.report.service.hpm.put<void>(`/report/pages/${this.page.name}/visuals/${this.name}/sortBy`, request, { uid: this.page.report.config.uniqueId }, this.page.report.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }
}
