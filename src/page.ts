import { IFilterable } from './ifilterable';
import { IReportNode } from './report';
import { VisualDescriptor } from './visualDescriptor';
import * as models from 'powerbi-models';
import * as utils from './util';
import * as errors from './errors';

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
   * @type {models.SectionVisibility}
   */
   visibility: models.SectionVisibility;

  /**
   * Page size as saved in the report.
   * @type {models.ICustomPageSize}
   */
  defaultSize: models.ICustomPageSize;

  /**
   * Page display options as saved in the report.
   * @type {models.ICustomPageSize}
   */
  defaultDisplayOption: models.DisplayOption;

  /**
   * Creates an instance of a Power BI report page.
   *
   * @param {IReportNode} report
   * @param {string} name
   * @param {string} [displayName]
   * @param {boolean} [isActivePage]
   * @param {models.SectionVisibility} [visibility]
   * @hidden
   */
  constructor(report: IReportNode, name: string, displayName?: string, isActivePage?: boolean, visibility?: models.SectionVisibility, defaultSize?: models.ICustomPageSize, defaultDisplayOption?: models.DisplayOption) {
    this.report = report;
    this.name = name;
    this.displayName = displayName;
    this.isActive = isActivePage;
    this.visibility = visibility;
    this.defaultSize = defaultSize;
    this.defaultDisplayOption = defaultDisplayOption;
  }

  /**
   * Gets all page level filters within the report.
   *
   * ```javascript
   * page.getFilters()
   *  .then(filters => { ... });
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
   * Delete the page from the report
   *
   * ```javascript
   * // Delete the page from the report
   * page.delete();
   * ```
   *
   * @returns {Promise<void>}
   */
  delete(): Promise<void> {
    return this.report.service.hpm.delete<models.IError[]>(`/report/pages/${this.name}`, { }, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow)
    .then(response => {
      return response.body;
    })
    .catch(response => {
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
  getVisuals(): Promise<VisualDescriptor[]> {
    if (utils.isRDLEmbed(this.report.config.embedUrl)) {
      return Promise.reject(errors.APINotSupportedForRDLError);
    }

    return this.report.service.hpm.get<models.IVisual[]>(`/report/pages/${this.name}/visuals`, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow)
      .then(response => {
        return response.body
          .map(visual => {
            return new VisualDescriptor(this, visual.name, visual.title, visual.type, visual.layout);
          });
      }, response => {
        throw response.body;
      });
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
  hasLayout(layoutType): Promise<boolean> {
    if (utils.isRDLEmbed(this.report.config.embedUrl)) {
      return Promise.reject(errors.APINotSupportedForRDLError);
    }

    let layoutTypeEnum = models.LayoutType[layoutType];
    return this.report.service.hpm.get<boolean>(`/report/pages/${this.name}/layoutTypes/${layoutTypeEnum}`, { uid: this.report.config.uniqueId }, this.report.iframe.contentWindow)
      .then(response => response.body,
      response => {
        throw response.body;
      });
  }
}