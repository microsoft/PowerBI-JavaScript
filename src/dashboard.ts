import * as service from './service';
import * as embed from './embed';
import * as models from 'powerbi-models';

/**
 * A Dashboard node within a dashboard hierarchy
 *
 * @export
 * @interface IDashboardNode
 */
export interface IDashboardNode {
    iframe: HTMLIFrameElement;
    service: service.IService;
    config: embed.IEmbedConfigurationBase
}

/**
 * A Power BI Dashboard embed component
 *
 * @export
 * @class Dashboard
 * @extends {embed.Embed}
 * @implements {IDashboardNode}
 * @implements {IFilterable}
 */
export class Dashboard extends embed.Embed implements IDashboardNode {
    /** @hidden */  
    static allowedEvents = ["tileClicked", "error"];
    /** @hidden */  
    static dashboardIdAttribute = 'powerbi-dashboard-id';
    /** @hidden */  
    static typeAttribute = 'powerbi-type';
    /** @hidden */  
    static type = "Dashboard";

    /**
     * Creates an instance of a Power BI Dashboard.
     *
     * @param {service.Service} service
     * @hidden
     * @param {HTMLElement} element
     */
    constructor(service: service.Service, element: HTMLElement, config: embed.IEmbedConfigurationBase, phasedRender?: boolean, isBootstrap?: boolean) {
        super(service, element, config, /* iframe */ undefined, phasedRender, isBootstrap);
        this.loadPath = "/dashboard/load";
        this.phasedLoadPath = "/dashboard/prepare";

        Array.prototype.push.apply(this.allowedEvents, Dashboard.allowedEvents);
    }

    /**
     * This adds backwards compatibility for older config which used the dashboardId query param to specify dashboard id.
     * E.g. https://powerbi-df.analysis-df.windows.net/dashboardEmbedHost?dashboardId=e9363c62-edb6-4eac-92d3-2199c5ca2a9e
     *
     * By extracting the id we can ensure id is always explicitly provided as part of the load configuration.
     * @hidden
     * @static
     * @param {string} url
     * @returns {string}
     */
    static findIdFromEmbedUrl(url: string): string {
        const dashboardIdRegEx = /dashboardId="?([^&]+)"?/
        const dashboardIdMatch = url.match(dashboardIdRegEx);

        let dashboardId;
        if (dashboardIdMatch) {
            dashboardId = dashboardIdMatch[1];
        }

        return dashboardId;
    }

    /**
     * Get dashboard id from first available location: options, attribute, embed url.
     *
     * @returns {string}
     */
    getId(): string {
        let config = <embed.IEmbedConfiguration>this.config;
        const dashboardId = config.id || this.element.getAttribute(Dashboard.dashboardIdAttribute) || Dashboard.findIdFromEmbedUrl(config.embedUrl);

        if (typeof dashboardId !== 'string' || dashboardId.length === 0) {
            throw new Error(`Dashboard id is required, but it was not found. You must provide an id either as part of embed configuration or as attribute '${Dashboard.dashboardIdAttribute}'.`);
        }

        return dashboardId;
    }

    /**
     * Validate load configuration.
     * 
     * @hidden
     */
    validate(baseConfig: embed.IEmbedConfigurationBase): models.IError[] {
      const config = baseConfig as embed.IEmbedConfiguration;
      let error = models.validateDashboardLoad(config);
      return error ? error : this.ValidatePageView(config.pageView);
    }

    /**
     * Handle config changes.
     * @hidden
     * @returns {void}
     */
    configChanged(isBootstrap: boolean): void {
      if (isBootstrap) {
        return;
      }

      // Populate dashboard id into config object.
      (<embed.IEmbedConfiguration>this.config).id = this.getId();
    }

    /**
     * @hidden
     * @returns {string}
     */
    getDefaultEmbedUrlEndpoint(): string {
      return "dashboardEmbed";
    }

    /**
     * Validate that pageView has a legal value: if page view is defined it must have one of the values defined in models.PageView
     * @hidden
     */
    private ValidatePageView(pageView: models.PageView): models.IError[] {
      if (pageView && pageView !== "fitToWidth" && pageView !== "oneColumn" && pageView !== "actualSize") {
        return [{message: "pageView must be one of the followings: fitToWidth, oneColumn, actualSize"}];
      }
    }
}