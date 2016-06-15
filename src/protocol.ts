import * as jsen from 'jsen';

interface IValidationError {
  path: string;
  keyword: string;
  message: string;
}

export interface IError {
  message: string;
}

function normalizeError(error: IValidationError): IError {
  if(!error.message) {
    error.message = `${error.path} is invalid. Not meeting ${error.keyword} constraint`;
  }

  delete error.path;
  delete error.keyword;

  return error;
}

/**
 * Takes in schema and returns function which can be used to validate the schema with better semantics around exposing errors
 */
export function validate(schema: any, options?: any) {
  return (x: any): any[] => {
    const validate = jsen(schema, options);
    const isValid = validate(x);

    if(isValid) {
      return undefined;
    }
    else {
      return validate.errors
        .map(normalizeError);
    }
  }
}


export interface ISettings {
  filter?: any;
  filterPaneEnabled?: boolean;
  pageName?: string;
  pageNavigationEnabled?: boolean;
}

export const settingsSchema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "filter": {
      "type": "object"
    },
    "filterPaneEnabled": {
      "type": "boolean",
      "messages": {
        "type": "filterPaneEnabled must be a boolean"
      }
    },
    "pageName": {
      "type": "string",
      "messages": {
        "type": "pageName must be a string"
      }
    },
    "pageNavigationEnabled": {
      "type": "boolean",
      "messages": {
        "type": "pageNavigationEnabled must be a boolean"
      }
    }
  }
};

export const validateSettings = validate(settingsSchema);

/**
 * TODO: Consider adding type: "report" | "tile" property to indicate what type of object to embed
 * 
 * This would align with goal of having single embed page which adapts to the thing being embedded
 * instead of having M x N embed pages where M is type of object (report, tile) and N is authorization
 * type (PaaS, SaaS, Anonymous)
 */
export interface ILoad {
  accessToken: string;
  id: string;
  settings?: ISettings;
}

export const loadSchema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "accessToken": {
      "type": "string",
      "messages": {
        "type": "accessToken must be a string",
        "required": "accessToken is required"
      },
      "invalidMessage": "accessToken property is invalid"
    },
    "id": {
      "type": "string",
      "messages": {
        "type": "id must be a string",
        "required": "id is required"
      }
    },
    "settings": {
      "$ref": "#settings"
    }
  },
  "required": [
    "accessToken",
    "id"
  ]
};

export const validateLoad = validate(loadSchema, {
  schemas: {
    settings: settingsSchema
  }
});

export interface IEmbedOptions {
  type?: string;
  id?: string;
  accessToken?: string;
  embedUrl?: string;
  filterPaneEnabled?: boolean;
  getGlobalAccessToken?: () => string;
  logMessages?: boolean;
  wpmpName?: string;
}

export interface IReportEmbedOptions extends IEmbedOptions {
  settings: ISettings;
}

export interface IPageTarget {
  type: "page";
  name: string;
}
export const pageTargetSchema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": [
        "page"
      ],
      "messages": {
        "type": "type must be a string",
        "enum": "type must be 'page'",
        "required": "type is required"
      }
    },
    "name": {
      "type": "string",
      "messages": {
        "type": "name must be a string",
        "required": "name is required"
      }
    }
  },
  "required": [
    "type",
    "name"
  ]
};
export const validatePageTarget = validate(pageTargetSchema);

export interface IVisualTarget {
  type: "visual";
  id: string;
}
export const visualTargetSchema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": [
        "visual"
      ],
      "messages": {
        "type": "type must be a string",
        "enum": "type must be 'visual'",
        "required": "type is required"
      }
    },
    "id": {
      "type": "string",
      "messages": {
        "type": "id must be a string",
        "required": "id is required"
      }
    }
  },
  "required": [
    "type",
    "id"
  ]
};
export const validateVisualTarget = validate(visualTargetSchema);

export interface IPage {
  name: string;
  displayName: string;
}
export const pageSchema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "messages": {
        "type": "name must be a string",
        "required": "name is required"
      }
    },
    "displayName": {
      "type": "string",
      "messages": {
        "type": "displayName must be a string",
        "required": "displayName is required"
      }
    }
  },
  "required": [
    "name",
    "displayName"
  ]
};

export const validatePage = validate(pageSchema);
