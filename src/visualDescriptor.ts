import * as models from 'powerbi-models';
import { IFilterable } from './ifilterable';
import { IPageNode, Page } from './page';

/**
 * A Visual node within a report hierarchy
 * 
 * @export
 * @interface IVisualNode
 */
export interface IVisualNode {
  name: string;
  title: string;
  type: string;
  layout: models.IVisualLayout;
  page: IPageNode;
}

/**
 * A Power BI visual within a page
 * 
 * @export
 * @class VisualDescriptor
 * @implements {IVisualNode}
 */
export class VisualDescriptor implements IVisualNode {
  /**
   * The visual name
   * 
   * @type {string}
   */
  name: string;

  /**
   * The visual title
   * 
   * @type {string}
   */
  title: string;

  /**
   * The visual type
   * 
   * @type {string}
   */
  type: string;

  /**
   * The visual layout: position, size and visiblity.
   * 
   * @type {string}
   */
  layout: models.IVisualLayout;

  /**
   * The parent Power BI page that contains this visual
   * 
   * @type {IPageNode}
   */
  page: IPageNode;

  constructor(page: IPageNode, name: string, title: string, type: string, layout: models.IVisualLayout) {
    this.name = name;
    this.title = title;
    this.type = type;
    this.layout = layout;
    this.page = page;
  }
}
