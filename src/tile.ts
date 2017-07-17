import * as service from './service';
import * as models from 'powerbi-models';
import * as embed from './embed';
import * as utils from './util';

/**
 * The Power BI tile embed component
 * 
 * @export
 * @class Tile
 * @extends {Embed}
 */
export class Tile extends embed.Embed {
    static type = "Tile";
    static allowedEvents = ["tileClicked", "tileLoaded"];

    constructor(service: service.Service, element: HTMLElement, config: embed.IEmbedConfiguration) {
        config.embedUrl = utils.addParamToUrl(config.embedUrl, 'dashboardId', config.dashboardId);
        config.embedUrl = utils.addParamToUrl(config.embedUrl, 'tileId', config.id);

        super(service, element, config);
        Array.prototype.push.apply(this.allowedEvents, Tile.allowedEvents);

        window.addEventListener("message", this.receiveMessage.bind(this), false);
    }

    /**
     * The ID of the tile
     * 
     * @returns {string}
     */
    getId(): string {
        const tileId = this.config.id || Tile.findIdFromEmbedUrl(this.config.embedUrl);

        if (typeof tileId !== 'string' || tileId.length === 0) {
            throw new Error(`Tile id is required, but it was not found. You must provide an id either as part of embed configuration.`);
        }

        return tileId;
    }

    /**
     * Validate load configuration.
     */
    validate(config: models.IReportLoadConfiguration): models.IError[] {
        // we create load tile configuration from report load configuration
        // so we need to validate it
        return models.validateReportLoad(config);
    }

    /**
     * Sends load configuration data for tile
     * 
     * @param {models.ILoadConfiguration} config
     * @returns {Promise<void>}
     */
    load(config: embed.IInternalEmbedConfiguration): Promise<void> {
        const errors = this.validate(config);
        if (errors) {
            throw errors;
        }

        let height = config.height ? config.height : this.iframe.offsetHeight;
        let width = config.width ? config.width : this.iframe.offsetWidth;
        let action = config.action ? config.action : 'loadTile';

        let tileConfig = {
            action: action,
            height: height,
            width: width,
            accessToken: config.accessToken,
            tokenType: config.tokenType,
        }

        this.iframe.contentWindow.postMessage(JSON.stringify(tileConfig), "*")

        // In order to use this function the same way we use it in embed
        // we need to keep the return type the same as 'load' in embed 
        return new Promise<void>( () => {
            return;
        });
    }

    /**
     * Adds the ability to get tileId from url.
     * By extracting the ID we can ensure that the ID is always explicitly provided as part of the load configuration.
     * 
     * @static
     * @param {string} url
     * @returns {string}
     */
    static findIdFromEmbedUrl(url: string): string {
        const tileIdRegEx = /tileId="?([^&]+)"?/
        const tileIdMatch = url.match(tileIdRegEx);

        let tileId;
        if (tileIdMatch) {
            tileId = tileIdMatch[1];
        }

        return tileId;
    }

    /**
     * Adds the ability to get events from iframe
     * 
     * @param event: MessageEvent 
     */
    private receiveMessage(event: MessageEvent): void {
        if (event.data) {
            try {
                let messageData = JSON.parse(event.data);
                let value = {
                    navigationUrl: messageData.navigationUrl,
                    errors: messageData.error,
                    openReport: messageData.openReport
                };

                const tileEvent: service.IEvent<any> = {
                    type: 'tile',
                    id: this.config.uniqueId,
                    name: messageData.event,
                    value: value
                };

                this.service.handleTileEvents(tileEvent);
            }
            catch (e) {
                console.log("invalid message data");
                return;
            }
        } 
    }
}