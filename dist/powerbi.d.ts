
export interface IPowerBiElement extends HTMLElement {
    powerBiEmbed: Embed;
}
export interface IPowerBiConfiguration {
    autoEmbedOnContentLoaded?: boolean;
    onError?: (error: any) => any;
}

export class PowerBi {
    /**
     * List of components this service can embed.
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
    constructor(config?: IPowerBiConfiguration);
    /**
     * Handler for DOMContentLoaded which searches DOM for elements having 'powerbi-embed' attribute
     * and automatically attempts to embed a powerbi component based on information from the attributes.
     * Only runs if `config.autoEmbedOnContentLoaded` is true when the service is created.
     */
    init(container: HTMLElement): void;
    /**
     * Given an html element embed component based on configuration.
     * If component has already been created and attached to eleemnt simply return it to prevent creating duplicate components for same element.
     */
    embed(element: IPowerBiElement, config?: IEmbedOptions): Embed;
    /**
     * Remove component from the list of embedded components.
     */
    remove(component: Embed): void;
    /**
     * Handler for window message event.
     * Parses event data as json and if it came from an iframe that matches one from an existing embeded component re-dispatches the event on the iframe's parent element
     * to simulate the event bubbling through the two separate windows / DOMs.
     *
     * If an error occurs when parsing event.data call error handler provided during configuration.
     */
    onReceiveMessage(event: MessageEvent): void;
}


export interface IEmbedOptions {
    type?: string;
    id?: string;
    accessToken?: string;
    loadAction?: string;
    embedUrl?: string;
    webUrl?: string;
    name?: string;
    filterPaneEnabled?: boolean;
    getGlobalAccessToken?: () => string;
    overwrite?: boolean;
}
declare abstract class Embed {
    /**
     * Default options for embeddable component.
     */
    private static defaultOptions;
    element: HTMLElement;
    iframe: HTMLIFrameElement;
    options: IEmbedOptions;
    constructor(element: HTMLElement, options: IEmbedOptions);
    /**
     * Handler for when the iframe has finished loading the powerbi placeholder page.
     * This is used to inject configuration options such as access token, loadAction, etc
     * which allow iframe to load the actual report with authentication.
     */
    private load();
    /**
     * Get access token from first available location: options, attribute, global.
     */
    private getAccessToken();
    /**
     * Get embed url from first available location: options, attribute.
     */
    protected getEmbedUrl(): string;
    /**
     * Request the browser to make the components iframe fullscreen.
     */
    fullscreen(): void;
    /**
     * Exit fullscreen.
     */
    exitFullscreen(): void;
    /**
     * Return true if iframe is fullscreen,
     * otherwise return false
     */
    private isFullscreen(iframe);
}

export class Report extends Embed {
    static attribute: string;
    constructor(element: HTMLElement, options: IEmbedOptions);
    getEmbedUrl(): string;
}

export class Tile extends Embed {
    static attribute: string;
    constructor(element: HTMLElement, options: IEmbedOptions);
    getEmbedUrl(): string;
}