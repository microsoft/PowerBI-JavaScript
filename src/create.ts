import * as service from './service';
import * as models from 'powerbi-models';
import * as embed from './embed';
import * as utils from './util';
import { Defaults } from './defaults';

export class Create extends embed.Embed {

  constructor(service: service.Service, element: HTMLElement, config: embed.IEmbedConfiguration, phasedRender?: boolean) {
    super(service, element, config, /* iframe */ undefined, phasedRender);
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
  validate(config: embed.IEmbedConfigurationBase): models.IError[] {
    return models.validateCreateReport(config);
  }

  /**
   * Populate config for create
   * 
   * @param {IEmbedConfigurationBase}
   * @returns {void}
   */
  populateConfig(baseConfig: embed.IEmbedConfigurationBase): void {
      super.populateConfig(baseConfig);

      // TODO: Change when Object.assign is available.
      const settings = utils.assign({}, Defaults.defaultSettings, baseConfig.settings);
      this.config = utils.assign({ settings }, baseConfig);

      const config = <embed.IEmbedConfiguration>this.config;

      this.createConfig = {
          datasetId: config.datasetId || this.getId(),
          accessToken: config.accessToken,
          tokenType: config.tokenType,
          settings: settings,
          groupId:  config.groupId
      }
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
   */
  static findIdFromEmbedUrl(url: string): string {
    const datasetIdRegEx = /datasetId="?([^&]+)"?/
    const datasetIdMatch = url.match(datasetIdRegEx);

    let datasetId;
    if (datasetIdMatch) {
      datasetId = datasetIdMatch[1];
    }

    return datasetId;
  }
}