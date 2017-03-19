/*! powerbi-client v2.3.0 | (c) 2016 Microsoft Corporation MIT */
import * as service from './service';
import * as models from 'powerbi-models';
import * as embed from './embed';
export declare class Create extends embed.Embed {
    constructor(service: service.Service, element: HTMLElement, config: embed.IEmbedConfiguration);
    /**
     * Gets the dataset ID from the first available location: createConfig or embed url.
     *
     * @returns {string}
     */
    getId(): string;
    /**
     * Validate create report configuration.
     */
    validate(config: models.IReportCreateConfiguration): models.IError[];
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
    static findIdFromEmbedUrl(url: string): string;
}
