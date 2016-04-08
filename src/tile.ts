import { default as Embed, IEmbedOptions } from './embed';

export default class Tile extends Embed {
    static attribute: string = 'powerbi-tile';
    
    constructor(element: HTMLElement, options: IEmbedOptions) {
        /** Force loadAction on options to match the type of component. This is required to bootstrap iframe. */
        options.loadAction = 'loadTile';
        super(element, options);
    }
    
    getEmbedUrl(): string {
        let embedUrl = super.getEmbedUrl();

        if (!embedUrl) {
            const dashboardId = this.element.getAttribute('powerbi-dashboard');
            const tileId = this.element.getAttribute('powerbi-tile');

            if (!(dashboardId && tileId)) {
                throw new Error(`Embed url cannot be constructed. 'powerbi-embed' attribute was not specified and the fallback to 'powerbi-dashboard' and 'powerbi-tile' were not specified either.`);
            }

            embedUrl = `https://app.powerbi.com/embed?dashboardId=${dashboardId}&tileId=${tileId}`;
        }

        return embedUrl;
    }
}