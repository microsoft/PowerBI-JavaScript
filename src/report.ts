import { Embed, IEmbedOptions, ILoadMessage } from './embed';

export interface IReportLoadMessage extends ILoadMessage {
    reportId: string
}

export class Report extends Embed {
    static type = "Report";
    
    getEmbedUrl(): string {
        let embedUrl = super.getEmbedUrl();
        
        // TODO: Need safe way to add url parameters.
        // We are assuming embedUrls use query parameters to supply id of visual
        // so must prefix with '&'.
        if(!this.options.filterPaneEnabled) {
            embedUrl += `&filterPaneEnabled=false`;
        }

        return embedUrl;
    }

    load(options: IEmbedOptions, requireId: boolean = false) {
        if(requireId && typeof options.id !== 'string') {
            throw new Error(`id must be specified when loading reports on existing elements.`);
        }
        
        const message: IReportLoadMessage = {
            action: 'loadReport',
            reportId: options.id,
            accessToken: null
        };
        
        super.load(options, requireId, message);
    }
}