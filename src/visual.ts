// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DisplayOption,
  FiltersLevel,
  FiltersOperations,
  ICustomPageSize,
  IEmbedConfigurationBase,
  IError,
  IFilter,
  IReportEmbedConfiguration,
  IReportLoadConfiguration,
  IUpdateFiltersRequest,
  IVisual,
  IVisualEmbedConfiguration,
  LayoutType,
  PageLevelFilters,
  PageSizeType,
  PagesLayout,
  ReportLevelFilters,
  VisualContainerDisplayMode,
  VisualLevelFilters
} from 'powerbi-models';
import { IHttpPostMessageResponse } from 'http-post-message';
import { Service } from './service';
import { Report } from './report';
import { Page } from './page';
import { VisualDescriptor } from './visualDescriptor';

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
  /** @hidden */
  static RenderNotSupportedError = "render is not supported while embedding a visual.";

  /**
   * Creates an instance of a Power BI Single Visual.
   *
   * @param {Service} service
   * @param {HTMLElement} element
   * @param {IEmbedConfiguration} config
   * @hidden
   */
  constructor(service: Service, element: HTMLElement, baseConfig: IEmbedConfigurationBase, phasedRender?: boolean, isBootstrap?: boolean, iframe?: HTMLIFrameElement) {
    super(service, element, baseConfig, phasedRender, isBootstrap, iframe);
  }

  /**
   * @hidden
   */
  load(phasedRender?: boolean): Promise<void> {
    const config = this.config as IVisualEmbedConfiguration;

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
    const width = config.width ? config.width : this.iframe.offsetWidth;
    const height = config.height ? config.height : this.iframe.offsetHeight;

    const pageSize: ICustomPageSize = {
      type: PageSizeType.Custom,
      width: width,
      height: height,
    };

    const pagesLayout: PagesLayout = {};
    pagesLayout[config.pageName] = {
      defaultLayout: {
        displayState: {
          mode: VisualContainerDisplayMode.Hidden
        }
      },
      visualsLayout: {}
    };

    pagesLayout[config.pageName].visualsLayout[config.visualName] = {
      displayState: {
        mode: VisualContainerDisplayMode.Visible
      },
      x: 1,
      y: 1,
      z: 1,
      width: pageSize.width,
      height: pageSize.height
    };

    config.settings = config.settings || {};
    config.settings.filterPaneEnabled = false;
    config.settings.navContentPaneEnabled = false;
    config.settings.layoutType = LayoutType.Custom;
    config.settings.customLayout = {
      displayOption: DisplayOption.FitToPage,
      pageSize: pageSize,
      pagesLayout: pagesLayout
    };

    this.config = config;
    return super.load(phasedRender);
  }

  /**
   * Gets the list of pages within the report - not supported in visual
   *
   * @returns {Promise<Page[]>}
   */
  getPages(): Promise<Page[]> {
    throw Visual.GetPagesNotSupportedError;
  }

  /**
   * Sets the active page of the report - not supported in visual
   *
   * @param {string} pageName
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  setPage(_pageName: string): Promise<IHttpPostMessageResponse<void>> {
    throw Visual.SetPageNotSupportedError;
  }

  /**
   * Render a preloaded report, using phased embedding API
   *
   * @hidden
   * @returns {Promise<void>}
   */
  async render(_config?: IReportLoadConfiguration | IReportEmbedConfiguration): Promise<void> {
    throw Visual.RenderNotSupportedError;
  }

  /**
   * Gets the embedded visual descriptor object that contains the visual name, type, etc.
   *
   * ```javascript
   * visual.getVisualDescriptor()
   *   .then(visualDetails => { ... });
   * ```
   *
   * @returns {Promise<VisualDescriptor>}
   */
  async getVisualDescriptor(): Promise<VisualDescriptor> {
    const config = this.config as IVisualEmbedConfiguration;

    try {
      const response = await this.service.hpm.get<IVisual[]>(`/report/pages/${config.pageName}/visuals`, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      // Find the embedded visual from visuals of this page
      // TODO: Use the Array.find method when ES6 is available
      const embeddedVisuals = response.body.filter((pageVisual) => pageVisual.name === config.visualName);

      if (embeddedVisuals.length === 0) {
        const visualNotFoundError: IError = {
          message: "visualNotFound",
          detailedMessage: "Visual not found"
        };

        throw visualNotFoundError;
      }

      const embeddedVisual = embeddedVisuals[0];
      const currentPage = this.page(config.pageName);
      return new VisualDescriptor(currentPage, embeddedVisual.name, embeddedVisual.title, embeddedVisual.type, embeddedVisual.layout);
    } catch (response) {
      throw response.body;
    }
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
   * @returns {Promise<IFilter[]>}
   */
  async getFilters(filtersLevel?: FiltersLevel): Promise<IFilter[]> {
    const url: string = this.getFiltersLevelUrl(filtersLevel);
    try {
      const response = await this.service.hpm.get<IFilter[]>(url, { uid: this.config.uniqueId }, this.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Updates filters at the filter level.
   * Default filter level is visual level.
   *
   * ```javascript
   * const filters: [
   *    ...
   * ];
   *
   * visual.updateFilters(FiltersOperations.Add, filters, filtersLevel)
   *  .catch(errors => {
   *    ...
   *  });
   * ```
   *
   * @param {(IFilter[])} filters
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async updateFilters(operation: FiltersOperations, filters: IFilter[], filtersLevel?: FiltersLevel): Promise<IHttpPostMessageResponse<void>> {
    const updateFiltersRequest: IUpdateFiltersRequest = {
      filtersOperation: operation,
      filters: filters as VisualLevelFilters[] | PageLevelFilters[] | ReportLevelFilters[]
    };

    const url: string = this.getFiltersLevelUrl(filtersLevel);
    try {
      return await this.service.hpm.post<void>(url, updateFiltersRequest, { uid: this.config.uniqueId }, this.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
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
   * @param {(IFilter[])} filters
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async setFilters(filters: IFilter[], filtersLevel?: FiltersLevel): Promise<IHttpPostMessageResponse<void>> {
    const url: string = this.getFiltersLevelUrl(filtersLevel);
    try {
      return await this.service.hpm.put<void>(url, filters, { uid: this.config.uniqueId }, this.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Removes all filters from the current filter level.
   * Default filter level is visual level.
   *
   * ```javascript
   * visual.removeFilters(filtersLevel);
   * ```
   *
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async removeFilters(filtersLevel?: FiltersLevel): Promise<IHttpPostMessageResponse<void>> {
    return await this.updateFilters(FiltersOperations.RemoveAll, undefined, filtersLevel);
  }

  /**
   * @hidden
   */
  private getFiltersLevelUrl(filtersLevel: FiltersLevel): string {
    const config = this.config as IVisualEmbedConfiguration;
    switch (filtersLevel) {
      case FiltersLevel.Report:
        return `/report/filters`;
      case FiltersLevel.Page:
        return `/report/pages/${config.pageName}/filters`;
      default:
        return `/report/pages/${config.pageName}/visuals/${config.visualName}/filters`;
    }
  }
}
