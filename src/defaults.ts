import * as models from 'powerbi-models';

/** @hidden */  
export abstract class Defaults {
  public static defaultQnaSettings: models.IQnaSettings = {
    filterPaneEnabled: false
  };
}