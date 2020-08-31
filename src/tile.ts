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
export class Tile extends embed.Embed {
    /** @hidden */  
    static type = "Tile";
    /** @hidden */
    static allowedEvents = ["tileClicked", "tileLoaded"];

    /**
     * @hidden
     */
    constructor(service: service.Service, element: HTMLElement, baseConfig: embed.IEmbedConfigurationBase, phasedRender?: boolean, isBootstrap?: boolean) {
      let config = <embed.IEmbedConfiguration>baseConfig;
      super(service, element, config, /* iframe */ undefined, phasedRender, isBootstrap);
      this.loadPath = "/tile/load";
      Array.prototype.push.apply(this.allowedEvents, Tile.allowedEvents);
    }

    /**
     * The ID of the tile
     *
     * @returns {string}
     */
    getId(): string {
        let config = <embed.IEmbedConfiguration>this.config;
        const tileId = config.id || Tile.findIdFromEmbedUrl(this.config.embedUrl);

        if (typeof tileId !== 'string' || tileId.length === 0) {
            throw new Error(`Tile id is required, but it was not found. You must provide an id either as part of embed configuration.`);
        }

        return tileId;
    }

    /**
     * Validate load configuration.
     */
    validate(config: embed.IEmbedConfigurationBase): models.IError[] {
        let embedConfig = <embed.IEmbedConfiguration>config;
        return models.validateTileLoad(embedConfig);
    }

    /**
     * Handle config changes.
     *
     * @returns {void}
     */
    configChanged(isBootstrap: boolean): void {
      if (isBootstrap) {
        return;
      }

      // Populate tile id into config object.
      (<embed.IEmbedConfiguration>this.config).id = this.getId();
    }

    /**
     * @hidden
     * @returns {string}
     */
    getDefaultEmbedUrlEndpoint(): string {
      return "tileEmbed";
    }

    /**
     * Adds the ability to get tileId from url.
     * By extracting the ID we can ensure that the ID is always explicitly provided as part of the load configuration.
     *
     * @hidden
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
}