// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IError, IQuickCreateConfiguration, validateQuickCreate } from 'powerbi-models';
import { Service } from './service';
import { Embed, IEmbedConfigurationBase, ISessionHeaders } from './embed';

/**
 * A Power BI Quick Create component
 *
 * @export
 * @class QuickCreate
 * @extends {Embed}
 */
export class QuickCreate extends Embed {

  /**
   * Gets or sets the configuration settings for creating report.
   *
   * @type {IQuickCreateConfiguration}
   * @hidden
   */
  createConfig: IQuickCreateConfiguration;

  /*
   * @hidden
   */
  constructor(service: Service, element: HTMLElement, config: IQuickCreateConfiguration, phasedRender?: boolean, isBootstrap?: boolean) {
    super(service, element, config, /* iframe */ undefined, phasedRender, isBootstrap);

    service.router.post(`/reports/${this.config.uniqueId}/eventHooks/:eventName`, async (req, _res) => {
      switch (req.params.eventName) {
        case "newAccessToken":
          req.body = req.body || {};
          req.body.report = this;
          await service.invokeSDKHook(this.eventHooks?.accessTokenProvider, req, _res);
          break;

        default:
          break;
      }
    });
  }

  /**
   * Override the getId abstract function
   * QuickCreate does not need any ID
   *
   * @returns {string}
   */
  getId(): string {
    return null;
  }

  /**
   * Validate create report configuration.
   */
  validate(config: IEmbedConfigurationBase): IError[] {
    return validateQuickCreate(config);
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

    this.createConfig = this.config as IQuickCreateConfiguration;
  }

  /**
   * @hidden
   * @returns {string}
   */
  getDefaultEmbedUrlEndpoint(): string {
    return "quickCreate";
  }

  /**
   * Sends quickCreate configuration data.
   *
   * ```javascript
   * quickCreate({
   *   accessToken: 'eyJ0eXA ... TaE2rTSbmg',
   *   datasetCreateConfig: {}})
   * ```
   *
   * @hidden
   * @param {IQuickCreateConfiguration} createConfig
   * @returns {Promise<void>}
   */
  async create(): Promise<void> {
    const errors = validateQuickCreate(this.createConfig);
    if (errors) {
      throw errors;
    }

    try {
      const headers: ISessionHeaders = {
        uid: this.config.uniqueId,
        sdkSessionId: this.service.getSdkSessionId()
      };

      if (!!this.eventHooks?.accessTokenProvider) {
        headers.tokenProviderSupplied = true;
      }

      const response = await this.service.hpm.post<void>("/quickcreate", this.createConfig, headers, this.iframe.contentWindow);
      return response.body;
    } catch (response) {
      throw response.body;
    }
  }
}
