import * as models from 'powerbi-models';
import { IFilterable } from './ifilterable';
import { IPageNode, Page } from './page';

/**
 * A Visual node within a report hierarchy
 * 
 * @export
 * @interface IVisualNode
 */
export interface IVisualNode {
  name: string;
  page: IPageNode;
}

/**
 * A Power BI visual within a page
 * 
 * @export
 * @class Visual
 * @implements {IVisualNode}
 * @implements {IFilterable}
 */
export class Visual implements IVisualNode, IFilterable {
  /**
   * The visual name
   * 
   * @type {string}
   */
  name: string;
  /**
   * The parent Power BI page that contains this visual
   * 
   * @type {IPageNode}
   */
  page: IPageNode;

  constructor(page: IPageNode, name: string) {
    this.name = name;
    this.page = page;
  }

  /**
   * Gets all page level filters within a report.
   * 
   * ```javascript
   * visual.getFilters()
   *  .then(pages => { ... });
   * ```
   * 
   * @returns {(Promise<models.IFilter[]>)}
   */
  getFilters(): Promise<models.IFilter[]> {
    return this.page.report.service.hpm.get<models.IFilter[]>(`/report/pages/${this.page.name}/visuals/${this.name}/filters`, { uid: this.page.report.config.uniqueId }, this.page.report.iframe.contentWindow)
      .then(response => response.body,
      response => {
        throw response.body;
      });
  }

  /**
   * Removes all filters on this page of the report.
   * 
   * ```javascript
   * visual.removeFilters();
   * ```
   * 
   * @returns {Promise<void>}
   */
  removeFilters(): Promise<void> {
    return this.setFilters([]);
  }

  /**
   * Sets all filters at the visual level of the page.
   * 
   * ```javascript
   * visual.setFilters(filters)
   *  .catch(errors => { ... });
   * ```
   * 
   * @param {(models.IFilter[])} filters
   * @returns {Promise<void>}
   */
  setFilters(filters: models.IFilter[]): Promise<void> {
    return this.page.report.service.hpm.put<models.IError[]>(`/report/pages/${this.page.name}/visuals/${this.name}/filters`, filters, { uid: this.page.report.config.uniqueId }, this.page.report.iframe.contentWindow)
      .catch(response => {
        throw response.body;
      });
  }
}