import { default as Embed, IEmbedOptions } from './embed';

export default class Report extends Embed {
    // Attribute used to specify id for report and simultaneously used to know which type of object the id is for.
    static attribute: string = 'powerbi-report';
    
    constructor(element: HTMLElement, options: IEmbedOptions) {
        /** Force loadAction on options to match the type of component. This is required to bootstrap iframe. */
        options.loadAction = 'loadReport';
        super(element, options);
    }
    
    getEmbedUrl(): string {
        let embedUrl = super.getEmbedUrl();
        if (!embedUrl) {
            let reportId = this.options.id;
            
            if (!reportId) {
                reportId = this.element.getAttribute('powerbi-report');
            }

            if (!reportId) {
                throw new Error(`Embed url cannot be constructed. 'powerbi-embed' attribute was not specified and the fallback to 'powerbi-report' were not specified either.`);
            }

            embedUrl = `https://embedded.powerbi.com/appTokenReportEmbed?reportId=${reportId}`;
        }
        
        // TODO: Need safe way to add url parameters.
        if(!this.options.filterPaneEnabled) {
            embedUrl += `&filterPaneEnabled=false`;
        }

        return embedUrl;
    }
}