import { default as Embed, IEmbedOptions } from './embed';

export default class Tile extends Embed {
    static type = 'tile';
    
    constructor(element: HTMLElement, options: IEmbedOptions) {
        /** Force loadAction on options to match the type of component. This is required to bootstrap iframe. */
        options.loadAction = 'loadTile';
        super(element, options);
    }
    
    getEmbedUrl(): string {
        const embedUrl = super.getEmbedUrl();

        return embedUrl;
    }
}