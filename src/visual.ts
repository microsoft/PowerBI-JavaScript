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
  static type = "visual";

  static GetFiltersNotSupportedError = "Getting visual level filters is not supported.";
  static SetFiltersNotSupportedError = "Setting visual level filters is not supported.";
  static GetPagesNotSupportedError = "Get pages is not supported while embedding a visual.";
  static SetPageNotSupportedError = "Set page is not supported while embedding a visual.";

  /**
   * Creates an instance of a Power BI Single Visual.
   * 
   * @param {service.Service} service
   * @param {HTMLElement} element
   * @param {embed.IEmbedConfiguration} config
   */
  constructor(service: service.Service, element: HTMLElement, baseConfig: embed.IEmbedConfigurationBase, phasedRender?: boolean, iframe?: HTMLIFrameElement) {
    super(service, element, baseConfig, phasedRender, iframe);
  }

  load(baseConfig: embed.IEmbedConfigurationBase, phasedRender?: boolean): Promise<void> {
    var config = <embed.IVisualEmbedConfiguration>baseConfig;
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

    return super.load(config, phasedRender);
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
   * Gets filters that are applied at the visual level.
   * 
   * ```javascript
   * // Get filters applied at visual level
   * visual.getFilters()
   *   .then(filters => {
   *     ...
   *   });
   * ```
   * 
   * @returns {Promise<models.IFilter[]>}
   */
  getFilters(): Promise<models.IFilter[]> {
    throw Visual.GetFiltersNotSupportedError;
  }

  /**
   * Sets filters at the visual level.
   * 
   * ```javascript
   * const filters: [
   *    ...
   * ];
   * 
   * visual.setFilters(filters)
   *  .catch(errors => {
   *    ...
   *  });
   * ```
   * 
   * @param {(models.IFilter[])} filters
   * @returns {Promise<void>}
   */
  setFilters(filters: models.IFilter[]): Promise<void> {
    throw Visual.SetFiltersNotSupportedError;
  }
}
