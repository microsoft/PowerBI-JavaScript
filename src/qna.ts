import * as service from './service';
import * as models from 'powerbi-models';
import * as embed from './embed';
import * as utils from './util';

/**
 * The Power BI Qna embed component
 *
 * @export
 * @class Qna
 * @extends {Embed}
 */
export class Qna extends embed.Embed {
    static type = "Qna";
    static allowedEvents = ["loaded", "visualRendered"];

    constructor(service: service.Service, element: HTMLElement, config: embed.IEmbedConfigurationBase, phasedRender?: boolean, isBootstrap?: boolean) {
      super(service, element, config, /* iframe */ undefined, phasedRender, isBootstrap);

        this.loadPath = "/qna/load";
        this.phasedLoadPath = "/qna/prepare";
        Array.prototype.push.apply(this.allowedEvents, Qna.allowedEvents);
    }

    /**
     * The ID of the Qna embed component
     *
     * @returns {string}
     */
    getId(): string {
      return null;
    }

    /**
     * Change the question of the Q&A embed component
     *
     * @param question - question which will render Q&A data
     * @returns {string}
     */
    setQuestion(question: string): Promise<void> {
      const qnaData: models.IQnaInterpretInputData = {
        question: question
      };

      return this.service.hpm.post<models.IError[]>('/qna/interpret', qnaData, { uid: this.config.uniqueId }, this.iframe.contentWindow)
        .catch(response => {
          throw response.body;
        });
    }

    /**
     * Handle config changes.
     *
     * @returns {void}
     */
    configChanged(isBootstrap: boolean): void {
      // Nothing to do in qna embed.
    }

    getDefaultEmbedUrlEndpoint(): string {
      return "qnaEmbed";
    }

    /**
     * Validate load configuration.
     */
    validate(config: embed.IEmbedConfigurationBase): models.IError[] {
        return models.validateLoadQnaConfiguration(config);
    }
}