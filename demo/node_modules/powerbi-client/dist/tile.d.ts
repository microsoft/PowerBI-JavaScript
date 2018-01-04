/*! powerbi-client v2.3.1 | (c) 2016 Microsoft Corporation MIT */
import * as service from './service';
import * as models from 'powerbi-models';
import * as embed from './embed';
/**
 * The Power BI tile embed component
 *
 * @export
 * @class Tile
 * @extends {Embed}
 */
export declare class Tile extends embed.Embed {
    static type: string;
    static allowedEvents: string[];
    constructor(service: service.Service, element: HTMLElement, config: embed.IEmbedConfiguration);
    /**
     * The ID of the tile
     *
     * @returns {string}
     */
    getId(): string;
    /**
     * Validate load configuration.
     */
    validate(config: models.IReportLoadConfiguration): models.IError[];
    /**
     * Sends load configuration data for tile
     *
     * @param {models.ILoadConfiguration} config
     * @returns {Promise<void>}
     */
    load(config: embed.IInternalEmbedConfiguration): Promise<void>;
    /**
     * Adds the ability to get tileId from url.
     * By extracting the ID we can ensure that the ID is always explicitly provided as part of the load configuration.
     *
     * @static
     * @param {string} url
     * @returns {string}
     */
    static findIdFromEmbedUrl(url: string): string;
    /**
     * Adds the ability to get events from iframe
     *
     * @param event: MessageEvent
     */
    private receiveMessage(event);
}
