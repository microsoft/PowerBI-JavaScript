import * as protocol from './protocol';
import { Embed } from './embed';

export class Tile extends Embed {
    static type = "Tile";
    
    getEmbedUrl(): string {
        const embedUrl = super.getEmbedUrl();

        return embedUrl;
    }
    
    load(options: protocol.IEmbedOptions, requireId: boolean = false) {
        if(requireId && typeof options.id !== 'string') {
            throw new Error(`id must be specified when loading reports on existing elements.`);
        }
        
        const message: protocol.ILoad = {
            id: options.id,
            accessToken: null
        };
        
        return super.load(options, requireId, message);
    }
}