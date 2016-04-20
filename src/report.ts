import { default as Embed, IEmbedOptions } from './embed';

export default class Report extends Embed {
    constructor(element: HTMLElement, options: IEmbedOptions) {
        /** Force loadAction on options to match the type of component. This is required to bootstrap iframe. */
        options.loadAction = 'loadReport';
        super(element, options);
    }
    
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
}