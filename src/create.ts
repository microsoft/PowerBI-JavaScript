// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IReportCreateConfiguration, IError, validateCreateReport } from 'powerbi-models';
import { Service } from './service';
import { Embed, IEmbedConfigurationBase, IEmbedConfiguration } from './embed';
import * as utils from './util';

/**
 * A Power BI Report creator component
 *
 * @export
 * @class Create
 * @extends {Embed}
 */
export class Create extends Embed {
  /*
   * @hidden
   */
  constructor(service: Service, element: HTMLElement, config: IEmbedConfiguration | IReportCreateConfiguration, phasedRender?: boolean, isBootstrap?: boolean) {
    super(service, element, config, /* iframe */ undefined, phasedRender, isBootstrap);
  }

  /**
   * Gets the dataset ID from the first available location: createConfig or embed url.
   *
   * @returns {string}
   */
  getId(): string {
    const datasetId = (this.createConfig && this.createConfig.datasetId) ? this.createConfig.datasetId : Create.findIdFromEmbedUrl(this.config.embedUrl);

    if (typeof datasetId !== 'string' || datasetId.length === 0) {
      throw new Error('Dataset id is required, but it was not found. You must provide an id either as part of embed configuration.');
    }

    return datasetId;
  }

  /**
   * Validate create report configuration.
   */
  validate(config: IEmbedConfigurationBase): IError[] {
    return validateCreateReport(config);
  }

  /**
   * Handle config changes.
   *
   * @hidden
   * @returns {void}
   */
  configChanged(isBootstrap: boolean): void {
    if (isBootstrap) {
      return;
    }

    const config = this.config as IEmbedConfiguration | IReportCreateConfiguration;

    this.createConfig = {
      accessToken: config.accessToken,
      datasetId: config.datasetId || this.getId(),
      groupId: config.groupId,
      settings: config.settings,
      tokenType: config.tokenType,
      theme: config.theme
    };
  }

  /**
   * @hidden
   * @returns {string}
   */
  getDefaultEmbedUrlEndpoint(): string {
    return "reportEmbed";
  }

  /**
   * checks if the report is saved.
   *
   * ```javascript
   * report.isSaved()
   * ```
   *
   * @returns {Promise<boolean>}
   */
  async isSaved(): Promise<boolean> {
    return await utils.isSavedInternal(this.service.hpm, this.config.uniqueId, this.iframe.contentWindow);
  }

  /**
   * Adds the ability to get datasetId from url.
   * (e.g. http://embedded.powerbi.com/appTokenReportEmbed?datasetId=854846ed-2106-4dc2-bc58-eb77533bf2f1).
   *
   * By extracting the ID we can ensure that the ID is always explicitly provided as part of the create configuration.
   *
   * @static
   * @param {string} url
   * @returns {string}
   * @hidden
   */
  static findIdFromEmbedUrl(url: string): string {
    const datasetIdRegEx = /datasetId="?([^&]+)"?/;
    const datasetIdMatch = url.match(datasetIdRegEx);

    let datasetId: string;
    if (datasetIdMatch) {
      datasetId = datasetIdMatch[1];
    }

    return datasetId;
  }
}
