/*! powerbi-client v2.0.0-beta.13 | (c) 2016 Microsoft Corporation MIT */
import { Embed } from './embed';
/**
 * The Power BI tile embed component
 *
 * @export
 * @class Tile
 * @extends {Embed}
 */
export declare class Tile extends Embed {
    static type: string;
    /**
     * The the id of the tile
     *
     * @returns {string}
     */
    getId(): string;
}
