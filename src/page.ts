import { IFilterable } from './ifilterable';
import { IReportNode } from './report';
import { Visual } from './visual';
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
   * Creates an instance of a Power BI report page.
   * 
   * @param {IReportNode} report
   * @param {string} name
   * @param {string} [displayName]
   */
  constructor(report: IReportNode, name: string, displayName?: string) {
    this.report = report;
    this.name = name;
    this.displayName = displayName;
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
   * Gets all the visuals on the page.
   * 
   * ```javascript
   * page.getVisuals()
   *   .then(visuals => { ... });
   * ```
   * 
   * @returns {Promise<Visual[]>}
   */
  getVisuals(): Promise<Visual[]> {
    return this.report.service.hpm.get<models.IVisual[]>(`/report/pages/${this.name}/visuals`, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow)
      .then(response => {
        return response.body
          .map(visual => {
            return new Visual(this, visual.name);
          });
      }, response => {
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
      displayName: null
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

  /**
   * Creates a Visual object given a name for the visual.
   * 
   * Normally you would get Visual objects by calling `page.getVisuals()` but in the case
   * that the visual name is known and you want to perform an action on a visual such as setting a filter
   * without having to retrieve it first you can create it directly.
   * 
   * Note: Because you are creating the visual manually there is no guarantee that the visual actually exists in the report and the subsequence requests could fail.
   * 
   * ```javascript
   * const visual = report.page('ReportSection1').visual('BarChart1');
   * visual.setFilters(filters);
   * ```
   * 
   * @param {string} name
   * @returns {Visual}
   */
  visual(name: string): Visual {
    return new Visual(this, name);
  }
}