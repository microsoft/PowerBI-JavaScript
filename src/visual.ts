import * as service from './service';
import * as embed from './embed';
import * as models from 'powerbi-models';
import { Report } from './report'
import { Page } from './page';

/**
 * The Power BI Visual embed component
 *
 * @export
 * @class Visual
 */
export class Visual extends Report {
  /** @hidden */
  static type = "visual";

  /** @hidden */
  static GetPagesNotSupportedError = "Get pages is not supported while embedding a visual.";
  /** @hidden */
  static SetPageNotSupportedError = "Set page is not supported while embedding a visual.";

  /**
   * Creates an instance of a Power BI Single Visual.
   *
   * @param {service.Service} service
   * @param {HTMLElement} element
   * @param {embed.IEmbedConfiguration} config
   * @hidden
   */
  constructor(service: service.Service, element: HTMLElement, baseConfig: embed.IEmbedConfigurationBase, phasedRender?: boolean, isBootstrap?: boolean, iframe?: HTMLIFrameElement) {
    super(service, element, baseConfig, phasedRender, isBootstrap, iframe);
  }

  load(phasedRender?: boolean): Promise<void> {
    var config = <embed.IVisualEmbedConfiguration>this.config;

    if (!config.accessToken) {
      // bootstrap flow.
      return;
    }

    if (typeof config.pageName !== 'string' || config.pageName.length === 0) {
      throw new Error(`Page name is required when embedding a visual.`);
    }

    if (typeof config.visualName !== 'string' || config.visualName.length === 0) {
      throw new Error(`Visual name is required, but it was not found. You must provide a visual name as part of embed configuration.`);
    }

    // calculate custom layout settings and override config.
    let width = config.width ? config.width : this.iframe.offsetWidth;
    let height = config.height ? config.height : this.iframe.offsetHeight;

    const pageSize: models.ICustomPageSize = {
      type: models.PageSizeType.Custom,
      width: width,
      height: height,
    };

    let pagesLayout: models.PagesLayout = {};
    pagesLayout[config.pageName] = {
      defaultLayout: {
        displayState: {
          mode: models.VisualContainerDisplayMode.Hidden
        }
      },
      visualsLayout: {}
    };

    pagesLayout[config.pageName].visualsLayout[config.visualName] = {
      displayState: {
        mode: models.VisualContainerDisplayMode.Visible
      },
      x: 1,
      y: 1,
      z: 1,
      width: pageSize.width,
      height: pageSize.height
    }

    config.settings = config.settings || {};
    config.settings.filterPaneEnabled = false;
    config.settings.navContentPaneEnabled = false;
    config.settings.layoutType = models.LayoutType.Custom;
    config.settings.customLayout = {
      displayOption: models.DisplayOption.FitToPage,
      pageSize: pageSize,
      pagesLayout: pagesLayout
    };

    this.config = config;
    return super.load(phasedRender);
  }

  /**
   * Gets the list of pages within the report - not supported in visual embed.
   *
   * @returns {Promise<Page[]>}
   */
  getPages(): Promise<Page[]> {
    throw Visual.GetPagesNotSupportedError;
  }

  /**
   * Sets the active page of the report - not supported in visual embed.
   *
   * @param {string} pageName
   * @returns {Promise<void>}
   */
  setPage(pageName: string): Promise<void> {
    throw Visual.SetPageNotSupportedError;
  }

  /**
   * Gets filters that are applied to the filter level.
   * Default filter level is visual level.
   *
   * ```javascript
   * visual.getFilters(filtersLevel)
   *   .then(filters => {
   *     ...
   *   });
   * ```
   *
   * @returns {Promise<models.IFilter[]>}
   */
  getFilters(filtersLevel?: models.FiltersLevel): Promise<models.IFilter[]> {
    const url: string = this.getFiltersLevelUrl(filtersLevel);
    return this.service.hpm.get<models.IFilter[]>(url, { uid: this.config.uniqueId }, this.iframe.contentWindow)
      .then(response => response.body,
      response => {
        throw response.body;
      });
  }

  /**
   * Sets filters at the filter level.
   * Default filter level is visual level.
   *
   * ```javascript
   * const filters: [
   *    ...
   * ];
   *
   * visual.setFilters(filters, filtersLevel)
   *  .catch(errors => {
   *    ...
   *  });
   * ```
   *
   * @param {(models.IFilter[])} filters
   * @returns {Promise<void>}
   */
  setFilters(filters: models.IFilter[], filtersLevel?: models.FiltersLevel): Promise<void> {
    const url: string = this.getFiltersLevelUrl(filtersLevel);
    return this.service.hpm.put<models.IError[]>(url, filters, { uid: this.config.uniqueId }, this.iframe.contentWindow)
      .catch(response => {
        throw response.body;
      });
  }

  /**
   * Removes all filters from the current filter level.
   * Default filter level is visual level.
   *
   * ```javascript
   * visual.removeFilters(filtersLevel);
   * ```
   *
   * @returns {Promise<void>}
   */
  removeFilters(filtersLevel?: models.FiltersLevel): Promise<void> {
    return this.setFilters([], filtersLevel);
  }

  /**
   * @hidden
   */
  private getFiltersLevelUrl(filtersLevel: models.FiltersLevel): string {
    const config = <embed.IVisualEmbedConfiguration>this.config;
    switch (filtersLevel) {
      case models.FiltersLevel.Report:
        return `/report/filters`;
      case models.FiltersLevel.Page:
        return `/report/pages/${config.pageName}/filters`;
      default:
        return `/report/pages/${config.pageName}/visuals/${config.visualName}/filters`;
    }
  }
}
