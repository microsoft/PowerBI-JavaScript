import * as models from 'powerbi-models';
import { Embed } from './embed';

/**
 * The Power BI tile embed component
 * 
 * @export
 * @class Tile
 * @extends {Embed}
 */
export class Tile extends Embed {
  static type = "Tile";

  /**
   * The ID of the tile
   * 
   * @returns {string}
   */
  getId(): string {
    throw new Error('Not implemented. Embedding tiles is not supported yet.');
  }

  /**
   * Validate load configuration.
   */
  validate(config: any): models.IError[] {
    throw new Error('Not implemented. Embedding tiles is not supported yet.');
  }
}