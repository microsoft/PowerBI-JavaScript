import { default as Embed, IEmbedOptions } from './embed';
import Report from './report';
import Tile from './tile';
import Utils from './util';

declare type Component = (typeof Report | typeof Tile)

interface IComponentType {
    type: string;
    component: Component
}

export interface IPowerBiElement extends HTMLElement {
    powerBiEmbed: Embed;
}

export interface IPowerBiConfiguration {
    autoEmbedOnContentLoaded?: boolean;
    onError?: (error: any) => any;
}

export default class PowerBi {
    /**
     * List of components this service can embed.
     */
    // TODO: Find out how to use interface here instead of concrete type so we don't have to 
    // use union types which are maintenance problem
    private static components: Component[] = [
        Tile,
        Report
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
        'reportPageLoaded': 'report-load'
    };
    
    /**
     * Default configuration for service.
     */
    private static defaultConfig: IPowerBiConfiguration = {
        autoEmbedOnContentLoaded: false,
        onError: (...args) => console.log(args[0], args.slice(1))
    };

    // TODO: Should be private but need to be public for backwards compatibility.
    /** Save access token as fallback/global token to use when local token for report/tile is not provided. */
    accessToken: string;
    
    /** Configuration object */
    private config: IPowerBiConfiguration;
    
    /** List of components (Reports/Tiles) that have been embedded using this service instance. */
    private embeds: Embed[];
    
    constructor(config: IPowerBiConfiguration = {}) {
        this.embeds = [];
        window.addEventListener('message', this.onReceiveMessage.bind(this), false);
        
        // TODO: Change when Object.assign is available.
        this.config = Utils.assign({}, PowerBi.defaultConfig, config);
        
        if (this.config.autoEmbedOnContentLoaded) {
            window.addEventListener('DOMContentLoaded', (event: Event) => this.init(document.body), false);
        }
    }
    
    /**
     * Handler for DOMContentLoaded which searches DOM for elements having 'powerbi-embed' attribute
     * and automatically attempts to embed a powerbi component based on information from the attributes.
     * Only runs if `config.autoEmbedOnContentLoaded` is true when the service is created.
     */
    init(container: HTMLElement): void {
        container = (container && container instanceof HTMLElement) ? container : document.body;
        
        const elements = Array.prototype.slice.call(container.querySelectorAll('[powerbi-embed]'));
        elements.forEach(element => this.embed(element, { getGlobalAccessToken: () => this.accessToken }));
    }
    
    /**
     * Given an html element embed component based on configuration.
     * If component has already been created and attached to eleemnt simply return it to prevent creating duplicate components for same element.
     */
    embed(element: IPowerBiElement, config: IEmbedOptions = {}): Embed {
        let instance: Embed;
        
        if (element.powerBiEmbed && !config.overwrite) {
            instance = element.powerBiEmbed;
            return instance;
        }
        
        /** If component is already registered on this element, but we are supposed to overwrite, remove existing component from registry */
        if (element.powerBiEmbed && config.overwrite) {
            this.remove(element.powerBiEmbed);
        }
        
        const Component = Utils.find(component => config.type === component.attribute || element.getAttribute(component.attribute) !== null, PowerBi.components);
        
        if (!Component) {
            throw new Error(`Attempted to embed using config ${config} on element ${element.outerHTML}, but could not determine what type of component to embed. You must specify a type in the configuration or as an attribute such as 'powerbi-report'.`);
        }
        
        // TODO: Consider removing in favor of passing reference to `this` in constructor
        // The getGlobalAccessToken function is only here so that the components (Tile | Report) can get the global access token without needing reference
        // to the service that they are registered within becaues it creates circular dependencies
        config.getGlobalAccessToken = () => this.accessToken;
        
        instance = new Component(element, config);
        element.powerBiEmbed = instance;
        this.embeds.push(instance);
        
        return instance;
    }
    
    /**
     * Deprecated alias for embed.
     * This performed the same function as embed. Embed is more semantic to the operation performed so we conslidated to a single method.
     */
    get = this.embed
    
    /**
     * Remove component from the list of embedded components.
     */
    remove(component: Embed): void {
        Utils.remove(x => x === component, this.embeds);
    }
    
    /**
     * Handler for window message event.
     * Parses event data as json and if it came from an iframe that matches one from an existing embeded component re-dispatches the event on the iframe's parent element
     * to simulate the event bubbling through the two separate windows / DOMs.
     * 
     * If an error occurs when parsing event.data call error handler provided during configuration.
     */
    onReceiveMessage(event: MessageEvent): void {
        if (!event) {
            return;
        }

        try {
            var messageData = JSON.parse(event.data);
            this.embeds.some(embed => {
                // Only raise the event on the embed that matches the post message origin
                if (event.source === embed.iframe.contentWindow) {
                    Utils.raiseCustomEvent(embed.element, PowerBi.eventMap[messageData.event], messageData);
                    return true;
                }
                
                return false;
            });
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


