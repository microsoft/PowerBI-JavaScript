import { Embed, IEmbedOptions, ILoadMessage } from './embed';

export interface ITileLoadMessage extends ILoadMessage {
    tileId: string
}

export class Tile extends Embed {
    static name = "Tile";
    
    getEmbedUrl(): string {
        const embedUrl = super.getEmbedUrl();

        return embedUrl;
    }
    
    load(options: IEmbedOptions, requireId: boolean = false) {
        if(requireId && typeof options.id !== 'string') {
            throw new Error(`id must be specified when loading reports on existing elements.`);
        }
        
        const message = {
            action: 'loadTile',
            tileId: options.id,
            accessToken: null
        };
        
        super.load(options, requireId, message);
    }
}