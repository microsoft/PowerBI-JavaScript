// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHttpPostMessageResponse } from 'http-post-message';
import { IError, IQnaInterpretInputData, validateLoadQnaConfiguration } from 'powerbi-models';
import { Embed, IEmbedConfigurationBase } from './embed';
import { Service } from './service';

/**
 * The Power BI Q&A embed component
 *
 * @export
 * @class Qna
 * @extends {Embed}
 */
export class Qna extends Embed {
  /** @hidden */
  static type = "Qna";
  /** @hidden */
  static allowedEvents = ["loaded", "visualRendered"];

  /**
   * @hidden
   */
  constructor(service: Service, element: HTMLElement, config: IEmbedConfigurationBase, phasedRender?: boolean, isBootstrap?: boolean) {
    super(service, element, config, /* iframe */ undefined, phasedRender, isBootstrap);

    this.loadPath = "/qna/load";
    this.phasedLoadPath = "/qna/prepare";
    Array.prototype.push.apply(this.allowedEvents, Qna.allowedEvents);
  }

  /**
   * The ID of the Q&A embed component
   *
   * @returns {string}
   */
  getId(): string {
    return null;
  }

  /**
   * Change the question of the Q&A embed component
   *
   * @param {string} question - question which will render Q&A data
   * @returns {Promise<IHttpPostMessageResponse<void>>}
   */
  async setQuestion(question: string): Promise<IHttpPostMessageResponse<void>> {
    const qnaData: IQnaInterpretInputData = {
      question: question
    };

    try {
      return await this.service.hpm.post<void>('/qna/interpret', qnaData, { uid: this.config.uniqueId }, this.iframe.contentWindow);
    } catch (response) {
      throw response.body;
    }
  }

  /**
   * Handle config changes.
   *
   * @returns {void}
   */
  configChanged(_isBootstrap: boolean): void {
    // Nothing to do in Q&A embed.
  }

  /**
   * @hidden
   * @returns {string}
   */
  getDefaultEmbedUrlEndpoint(): string {
    return "qnaEmbed";
  }

  /**
   * Validate load configuration.
   */
  validate(config: IEmbedConfigurationBase): IError[] {
    return validateLoadQnaConfiguration(config);
  }
}
