import { IFilterable } from './ifilterable';
import { IReportNode } from './report';
import * as models from 'powerbi-models';

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
   * Creates an instance of a Power BI report page.
   * 
   * @param {IReportNode} report
   * @param {string} name
   * @param {string} [displayName]
   * @param {boolean} [isActivePage]
   */
  constructor(report: IReportNode, name: string, displayName?: string, isActivePage?: boolean) {
    this.report = report;
    this.name = name;
    this.displayName = displayName;
    this.isActive = isActivePage;
  }

  /**
   * Gets all page level filters within the report.
   * 
   * ```javascript
   * page.getFilters()
   *  .then(pages => { ... });
   * ```
   * 
   * @returns {(Promise<models.IFilter[]>)}
   */
  getFilters(): Promise<models.IFilter[]> {
    return this.report.service.hpm.get<models.IFilter[]>(`/report/pages/${this.name}/filters`, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow)
      .then(response => response.body,
      response => {
        throw response.body;
      });
  }

  /**
   * Removes all filters from this page of the report.
   * 
   * ```javascript
   * page.removeFilters();
   * ```
   * 
   * @returns {Promise<void>}
   */
  removeFilters(): Promise<void> {
    return this.setFilters([]);
  }

  /**
   * Makes the current page the active page of the report.
   * 
   * ```javascripot
   * page.setActive();
   * ```
   * 
   * @returns {Promise<void>}
   */
  setActive(): Promise<void> {
    const page: models.IPage = {
      name: this.name,
      displayName: null,
      isActive: true
    };

    return this.report.service.hpm.put<models.IError[]>('/report/pages/active', page, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow)
      .catch(response => {
        throw response.body;
      });
  }

  /**
   * Sets all filters on the current page.
   * 
   * ```javascript
   * page.setFilters(filters);
   *   .catch(errors => { ... });
   * ```
   * 
   * @param {(models.IFilter[])} filters
   * @returns {Promise<void>}
   */
  setFilters(filters: models.IFilter[]): Promise<void> {
    return this.report.service.hpm.put<models.IError[]>(`/report/pages/${this.name}/filters`, filters, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow)
      .catch(response => {
        throw response.body;
      });
  }
}