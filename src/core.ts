import { Embed, IEmbedConstructor, IEmbedOptions } from './embed';
import { Report } from './report';
import { Tile } from './tile';
import { Utils } from './util';

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
    private static components: IEmbedConstructor[] = [
        Tile,
        Report,
        Dashboard
    ];
    /**
     * Mapping of event names from iframe postMessage to their name percieved by parent DOM.
     * Example: User clicks on embeded report which is inside iframe. The iframe code resends 
     * event as postMessage with { event: 'reportClicked', ... } and this name is converted to hyphenated
     * name and dispatched from the parent element of the iframe to simulate the event bubbling through two
     * different windows / DOMs
     */
    private static eventMap = {
        'tileClicked': 'tile-click',
        'tileLoaded': 'tile-load',
        'reportPageLoaded': 'report-load',
        'dashboardPageLoaded': 'dashboard-load'
    };
    
    /**
     * Default configuration for service.
     */
    private static defaultConfig: IPowerBiConfiguration = {
        autoEmbedOnContentLoaded: false,
        onError: (...args) => console.log(args[0], args.slice(1))
    };

    /** Save access token as fallback/global token to use when local token for report/tile is not provided. */
    accessToken: string;
    
    /** Configuration object */
    private config: IPowerBiConfiguration;
    
    /** List of components (Dashboards/Reports/Tiles) that have been embedded using this service instance. */
    private embeds: Embed[];
    
    constructor(config: IPowerBiConfiguration = {}) {
        this.embeds = [];
        window.addEventListener('message', this.onReceiveMessage.bind(this), false);
        
        // TODO: Change when Object.assign is available.
        this.config = Utils.assign({}, PowerBi.defaultConfig, config);
        
        if (this.config.autoEmbedOnContentLoaded) {
            this.enableAutoEmbed();
        }
    }
    
    /**
     * Handler for DOMContentLoaded which searches DOM for elements having 'powerbi-embed-url' attribute
     * and automatically attempts to embed a powerbi component based on information from the attributes.
     * Only runs if `config.autoEmbedOnContentLoaded` is true when the service is created.
     */
    init(container?: HTMLElement): void {
        container = (container && container instanceof HTMLElement) ? container : document.body;
        
        const elements = Array.prototype.slice.call(container.querySelectorAll(`[${Embed.embedUrlAttribute}]`));
        elements.forEach(element => this.embed(element));
    }
    
    /**
     * Given an html element embed component based on configuration.
     * If component has already been created and attached to element re-use component instance and existing iframe,
     * otherwise create a new component instance
     */
    embed(element: HTMLElement, config: IEmbedOptions = {}): Embed {
        let component: Embed;
        let powerBiElement = <IPowerBiElement>element;
        
        if (powerBiElement.powerBiEmbed) {
            component = this.embedExisting(powerBiElement, config);
        }
        else {
            component = this.embedNew(powerBiElement, config);
        }
        
        return component;
    }
    
    /**
     * Given an html element embed component base configuration.
     * Save component instance on element for later lookup. 
     */
    private embedNew(element: IPowerBiElement, config: IEmbedOptions): Embed {
        const componentType = config.type || element.getAttribute(Embed.typeAttribute);
        if (!componentType) {
            throw new Error(`Attempted to embed using config ${JSON.stringify(config)} on element ${element.outerHTML}, but could not determine what type of component to embed. You must specify a type in the configuration or as an attribute such as '${Embed.typeAttribute}="${Report.name.toLowerCase()}"'.`);
        }
        
        // Save type on configuration so it can be referenced later at known location
        config.type = componentType;
        
        const Component = Utils.find(component => componentType === component.name.toLowerCase(), PowerBi.components);
        if (!Component) {
            throw new Error(`Attempted to embed component of type: ${componentType} but did not find any matching component.  Please verify the type you specified is intended.`);
        }
        
        // TODO: Consider removing in favor of passing reference to `this` in constructor
        // The getGlobalAccessToken function is only here so that the components (Dashboard | Tile | Report) can get the global access token without needing reference
        // to the service that they are registered within becaues it creates circular dependencies
        config.getGlobalAccessToken = () => this.accessToken;
        
        const component = new Component(element, config);
        element.powerBiEmbed = component;
        this.embeds.push(component);
        
        return component;
    }
    
    private embedExisting(element: IPowerBiElement, config: IEmbedOptions): Embed {
        const component = Utils.find(x => x.element === element, this.embeds);
        if (!component) {
            throw new Error(`Attempted to embed using config ${JSON.stringify(config)} on element ${element.outerHTML} which already has embedded comopnent associated, but could not find the existing comopnent in the list of active components. This could indicate the embeds list is out of sync with the DOM, or the component is referencing the incorrect HTML element.`);
        }
        
        component.load(config, true);
        
        return component;
    }
    
    /**
     * Adds event handler for DOMContentLoaded which finds all elements in DOM with attribute powerbi-embed-url
     * then attempts to initiate the embed process based on data from other powerbi-* attributes.
     * (This is usually only useful for applications rendered on by the server since all the data needed will be available by the time the handler is called.)
     */
    enableAutoEmbed() {
        window.addEventListener('DOMContentLoaded', (event: Event) => this.init(document.body), false);
    }
    
    /**
     * Returns instance of component associated with element.
     */
    get(element: HTMLElement) {
        const powerBiElement = <IPowerBiElement>element;
        
        if (!powerBiElement.powerBiEmbed) {
            throw new Error(`You attempted to get an instance of powerbi component associated with element: ${element.outerHTML} but there was no associated instance.`);
        }
        
        return powerBiElement.powerBiEmbed;
    }
    
    /**
     * Given an html element which has component embedded within it, remove the component from list of embeds, remove association with component, and remove the iframe.
     */
    reset(element: HTMLElement) {
        const powerBiElement = <IPowerBiElement>element;
        
        if (!powerBiElement.powerBiEmbed) {
            return;
        }
        
        /** Remove component from internal list */
        Utils.remove(x => x === powerBiElement.powerBiEmbed, this.embeds);
        /** Delete property from html element */
        delete powerBiElement.powerBiEmbed;
        /** Remove iframe from element */
        const iframe = element.querySelector('iframe');
        if(iframe) {
            iframe.remove();
        }
    }
    
    /**
     * Handler for window message event.
     * Parses event data as json and if it came from an iframe that matches one from an existing embeded component re-dispatches the event on the iframe's parent element
     * to simulate the event bubbling through the two separate windows / DOMs.
     * 
     * If an error occurs when parsing event.data call error handler provided during configuration.
     */
    private onReceiveMessage(event: MessageEvent): void {
        if (!event) {
            return;
        }

        try {
            // Only raise the event on the embed that matches the post message origin
            const embed = Utils.find(embed => event.source === embed.iframe.contentWindow, this.embeds);
            if(embed) {
                let messageData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                Utils.raiseCustomEvent(embed.element, PowerBi.eventMap[messageData.event], messageData);
            }
        }
        catch (e) {
            if (typeof this.config.onError === 'function') {
                this.config.onError.call(window, e);
            }
            else {
                throw e;
            }
        }
    }
}

// export default PowerBi;