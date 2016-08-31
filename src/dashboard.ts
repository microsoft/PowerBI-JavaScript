import * as service from './service';
import * as embed from './embed';
import * as models from 'powerbi-models';
import * as wpmp from 'window-post-message-proxy';
import * as hpm from 'http-post-message';
import * as utils from './util';

/**
 * A Dashboard node within a dashboard hierarchy
 * 
 * @export
 * @interface IDashboardNode
 */
export interface IDashboardNode {
    iframe: HTMLIFrameElement;
    service: service.IService;
    config: embed.IInternalEmbedConfiguration
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
    static allowedEvents = ["tileClicked", "error"];
    static dashboardIdAttribute = 'powerbi-dashboard-id';
    static typeAttribute = 'powerbi-type';
    static type = "Dashboard";

    /**
     * Creates an instance of a Power BI Dashboard.
     * 
     * @param {service.Service} service
     * @param {HTMLElement} element
     */
    constructor(service: service.Service, element: HTMLElement, config: embed.IEmbedConfiguration) {
        super(service, element, config);
        Array.prototype.push.apply(this.allowedEvents, Dashboard.allowedEvents);
    }

    /**
     * This adds backwards compatibility for older config which used the dashboardId query param to specify dashboard id.
     * E.g. https://powerbi-df.analysis-df.windows.net/dashboardEmbedHost?dashboardId=e9363c62-edb6-4eac-92d3-2199c5ca2a9e
     * 
     * By extracting the id we can ensure id is always explicitly provided as part of the load configuration.
     * 
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
        const dashboardId = this.config.id || this.element.getAttribute(Dashboard.dashboardIdAttribute) || Dashboard.findIdFromEmbedUrl(this.config.embedUrl);

        if (typeof dashboardId !== 'string' || dashboardId.length === 0) {
            throw new Error(`Dashboard id is required, but it was not found. You must provide an id either as part of embed configuration or as attribute '${Dashboard.dashboardIdAttribute}'.`);
        }

        return dashboardId;
    }
}