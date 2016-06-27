import { Embed } from './embed';

export class Tile extends Embed {
    static type = "Tile";

    getId(): string {
        throw Error('Not implemented. Embedding tiles is not supported yet.');
    }
}