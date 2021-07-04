// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IError, validateTileLoad } from 'powerbi-models';
import { Service } from './service';
import { Embed, IEmbedConfigurationBase, ITileEmbedConfiguration } from './embed';

/**
 * The Power BI tile embed component
 *
 * @export
 * @class Tile
 * @extends {Embed}
 */
export class Tile extends Embed {
  /** @hidden */
  static type = "Tile";
  /** @hidden */
  static allowedEvents = ["tileClicked", "tileLoaded"];

  /**
   * @hidden
   */
  constructor(service: Service, element: HTMLElement, baseConfig: IEmbedConfigurationBase, phasedRender?: boolean, isBootstrap?: boolean) {
    const config = baseConfig as ITileEmbedConfiguration;
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
    const config = this.config as ITileEmbedConfiguration;
    const tileId = config.id || Tile.findIdFromEmbedUrl(this.config.embedUrl);

    if (typeof tileId !== 'string' || tileId.length === 0) {
      throw new Error(`Tile id is required, but it was not found. You must provide an id either as part of embed configuration.`);
    }

    return tileId;
  }

  /**
   * Validate load configuration.
   */
  validate(config: IEmbedConfigurationBase): IError[] {
    const embedConfig = config as ITileEmbedConfiguration;
    return validateTileLoad(embedConfig);
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
    (this.config as ITileEmbedConfiguration).id = this.getId();
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
    const tileIdRegEx = /tileId="?([^&]+)"?/;
    const tileIdMatch = url.match(tileIdRegEx);

    let tileId: string;
    if (tileIdMatch) {
      tileId = tileIdMatch[1];
    }

    return tileId;
  }
}
