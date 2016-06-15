export declare class Utils {
    static raiseCustomEvent(element: HTMLElement, eventName: string, eventData: any): void;
    static findIndex<T>(predicate: (T) => boolean, xs: T[]): number;
    static find<T>(predicate: (T) => boolean, xs: T[]): T;
    static remove<T>(predicate: (T) => boolean, xs: T[]): void;
    static assign: (...args: any[]) => any;
}

export interface IError {
    message: string;
}
/**
 * Takes in schema and returns function which can be used to validate the schema with better semantics around exposing errors
 */
export declare function validate(schema: any, options?: any): (x: any) => any[];
export interface ISettings {
    filter?: any;
    filterPaneEnabled?: boolean;
    pageName?: string;
    pageNavigationEnabled?: boolean;
}
export declare const settingsSchema: {
    "$schema": string;
    "type": string;
    "properties": {
        "filter": {
            "type": string;
        };
        "filterPaneEnabled": {
            "type": string;
            "messages": {
                "type": string;
            };
        };
        "pageName": {
            "type": string;
            "messages": {
                "type": string;
            };
        };
        "pageNavigationEnabled": {
            "type": string;
            "messages": {
                "type": string;
            };
        };
    };
};
export declare const validateSettings: (x: any) => any[];
/**
 * TODO: Consider adding type: "report" | "tile" property to indicate what type of object to embed
 *
 * This would align with goal of having single embed page which adapts to the thing being embedded
 * instead of having M x N embed pages where M is type of object (report, tile) and N is authorization
 * type (PaaS, SaaS, Anonymous)
 */
export interface ILoadConfiguration {
    accessToken: string;
    id: string;
    settings?: ISettings;
}
export declare const loadSchema: {
    "$schema": string;
    "type": string;
    "properties": {
        "accessToken": {
            "type": string;
            "messages": {
                "type": string;
                "required": string;
            };
            "invalidMessage": string;
        };
        "id": {
            "type": string;
            "messages": {
                "type": string;
                "required": string;
            };
        };
        "settings": {
            "$ref": string;
        };
    };
    "required": string[];
};
export declare const validateLoad: (x: any) => any[];
export interface IPageTarget {
    type: "page";
    name: string;
}
export declare const pageTargetSchema: {
    "$schema": string;
    "type": string;
    "properties": {
        "type": {
            "type": string;
            "enum": string[];
            "messages": {
                "type": string;
                "enum": string;
                "required": string;
            };
        };
        "name": {
            "type": string;
            "messages": {
                "type": string;
                "required": string;
            };
        };
    };
    "required": string[];
};
export declare const validatePageTarget: (x: any) => any[];
export interface IVisualTarget {
    type: "visual";
    id: string;
}
export declare const visualTargetSchema: {
    "$schema": string;
    "type": string;
    "properties": {
        "type": {
            "type": string;
            "enum": string[];
            "messages": {
                "type": string;
                "enum": string;
                "required": string;
            };
        };
        "id": {
            "type": string;
            "messages": {
                "type": string;
                "required": string;
            };
        };
    };
    "required": string[];
};
export declare const validateVisualTarget: (x: any) => any[];
export interface IPage {
    name: string;
    displayName: string;
}
export declare const pageSchema: {
    "$schema": string;
    "type": string;
    "properties": {
        "name": {
            "type": string;
            "messages": {
                "type": string;
                "required": string;
            };
        };
        "displayName": {
            "type": string;
            "messages": {
                "type": string;
                "required": string;
            };
        };
    };
    "required": string[];
};
export declare const validatePage: (x: any) => any[];


export declare class Tile extends Embed {
    static type: string;
}


export interface IPowerBiElement extends HTMLElement {
    powerBiEmbed: embed.Embed;
}
export interface IPowerBiConfiguration {
    autoEmbedOnContentLoaded?: boolean;
    onError?: (error: any) => any;
}
export declare class PowerBi {
    /**
     * List of components this service can embed.
     */
    /**
     * TODO: See if it's possible to remove need for this interface and just use Embed base object as common between Tile and Report
     * This was only put it to allow both types of components to be in the same list
     */
    private static components;
    /**
     * Mapping of event names from iframe postMessage to their name percieved by parent DOM.
     * Example: User clicks on embeded report which is inside iframe. The iframe code resends
     * event as postMessage with { event: 'reportClicked', ... } and this name is converted to hyphenated
     * name and dispatched from the parent element of the iframe to simulate the event bubbling through two
     * different windows / DOMs
     */
    private static eventMap;
    /**
     * Default configuration for service.
     */
    private static defaultConfig;
    /** Save access token as fallback/global token to use when local token for report/tile is not provided. */
    accessToken: string;
    /** Configuration object */
    private config;
    /** List of components (Reports/Tiles) that have been embedded using this service instance. */
    private embeds;
    private hpmFactory;
    private wpmpFactory;
    private routerFactory;
    constructor(hpmFactory: embed.IHpmFactory, wpmpFactory: embed.IWpmpFactory, routerFactory: embed.IRouterFactory, config?: IPowerBiConfiguration);
    /**
     * Handler for DOMContentLoaded which searches DOM for elements having 'powerbi-embed-url' attribute
     * and automatically attempts to embed a powerbi component based on information from the attributes.
     * Only runs if `config.autoEmbedOnContentLoaded` is true when the service is created.
     */
    init(container?: HTMLElement): void;
    /**
     * Given an html element embed component based on configuration.
     * If component has already been created and attached to element re-use component instance and existing iframe,
     * otherwise create a new component instance
     */
    embed(element: HTMLElement, config?: embed.IEmbedConfiguration): embed.Embed;
    /**
     * Given an html element embed component base configuration.
     * Save component instance on element for later lookup.
     */
    private embedNew(element, config);
    private embedExisting(element, config);
    /**
     * Adds event handler for DOMContentLoaded which finds all elements in DOM with attribute powerbi-embed-url
     * then attempts to initiate the embed process based on data from other powerbi-* attributes.
     * (This is usually only useful for applications rendered on by the server since all the data needed will be available by the time the handler is called.)
     */
    enableAutoEmbed(): void;
    /**
     * Returns instance of component associated with element.
     */
    get(element: HTMLElement): embed.Embed;
    /**
     * Given an html element which has component embedded within it, remove the component from list of embeds, remove association with component, and remove the iframe.
     */
    reset(element: HTMLElement): void;
    /**
     * Handler for window message event.
     * Parses event data as json and if it came from an iframe that matches one from an existing embeded component re-dispatches the event on the iframe's parent element
     * to simulate the event bubbling through the two separate windows / DOMs.
     *
     * If an error occurs when parsing event.data call error handler provided during configuration.
     */
    private onReceiveMessage(event);
}

/**
 * TODO: Need to find better place for these factory functions or refactor how we handle dependency injection
 * Need to
 */

export { IHpmFactory, IWpmpFactory, IRouterFactory };
export declare const hpmFactory: IHpmFactory;
export declare const wpmpFactory: IWpmpFactory;
export declare const routerFactory: IRouterFactory;


declare global  {
    interface Window {
        Powerbi: typeof PowerBi;
        powerbi: PowerBi;
    }
}
