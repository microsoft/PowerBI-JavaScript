import * as embed from './embed';
import { Report } from './report';
import { Tile } from './tile';
import * as utils from './util';
import * as wpmp from 'window-post-message-proxy';
import * as hpm from 'http-post-message';
import * as router from 'powerbi-router';
import * as models from 'powerbi-models';

export interface IEvent<T> {
    type: string;
    id: string;
    name: string;
    value: T;
}

export interface IEventHandler<T> {
    (event: IEvent<T>): any;
}

export interface IHpmFactory {
    (targetWindow: Window, wpmp: wpmp.WindowPostMessageProxy, version?: string, type?: string, origin?: string): hpm.HttpPostMessage;
}

export interface IWpmpFactory {
    (name?: string, logMessages?: boolean, eventSourceOverrideWindow?: Window): wpmp.WindowPostMessageProxy;
}

export interface IRouterFactory {
    (wpmp: wpmp.WindowPostMessageProxy): router.Router;
}

export interface IPowerBiElement extends HTMLElement {
    powerBiEmbed: embed.Embed;
}

export interface IDebugOptions {
    logMessages?: boolean;
    wpmpName?: string;
    eventSourceOverrideWindow?: Window;
}

export interface IServiceConfiguration extends IDebugOptions {
    autoEmbedOnContentLoaded?: boolean;
    onError?: (error: any) => any;
}

export class Service {

    /**
     * List of components this service can embed.
     */
    /**
     * TODO: See if it's possible to remove need for this interface and just use Embed base object as common between Tile and Report
     * This was only put it to allow both types of components to be in the same list
     */
    private static components: (typeof Report | typeof Tile)[] = [
        Tile,
        Report
    ];
    
    /**
     * Default configuration for service.
     */
    private static defaultConfig: IServiceConfiguration = {
        autoEmbedOnContentLoaded: false,
        onError: (...args) => console.log(args[0], args.slice(1))
    };

    /** Save access token as fallback/global token to use when local token for report/tile is not provided. */
    accessToken: string;
    
    /** Configuration object */
    private config: IServiceConfiguration;
    
    /** List of components (Reports/Tiles) that have been embedded using this service instance. */
    private embeds: embed.Embed[];
    private hpmFactory: IHpmFactory;
    /** TODO: Look for way to make this private. This should be private but in embed constructor needs to pass the wpmp instance to the hpm factory. */
    public wpmp: wpmp.WindowPostMessageProxy;
    private router: router.Router;

    constructor(hpmFactory: IHpmFactory, wpmpFactory: IWpmpFactory, routerFactory: IRouterFactory, config: IServiceConfiguration = {}) {
        this.hpmFactory = hpmFactory;
        this.wpmp = wpmpFactory(config.wpmpName, config.logMessages);
        this.router = routerFactory(this.wpmp);

        /**
         * Add handler for report events
         */
        this.router.post(`/reports/:uniqueId/events/:eventName`, (req, res) => {
            const event: IEvent<any> = {
                type: 'report',
                id: req.params.uniqueId,
                name: req.params.eventName,
                value: req.body
            };

            this.handleEvent(event);
        });
        this.router.post(`/reports/:uniqueId/pages/:pageName/events/:eventName`, (req, res) => {
            const event: IEvent<any> = {
                type: 'report',
                id: req.params.uniqueId,
                name: req.params.eventName,
                value: req.body
            };

            this.handleEvent(event);
        });
        this.router.post(`/reports/:uniqueId/visuals/:pageName/events/:eventName`, (req, res) => {
            const event: IEvent<any> = {
                type: 'report',
                id: req.params.uniqueId,
                name: req.params.eventName,
                value: req.body
            };

            this.handleEvent(event);
        });

        this.embeds = [];
        
        // TODO: Change when Object.assign is available.
        this.config = utils.assign({}, Service.defaultConfig, config);
        
        if (this.config.autoEmbedOnContentLoaded) {
            this.enableAutoEmbed();
        }

    }
    
    /**
     * Handler for DOMContentLoaded which searches DOM for elements having 'powerbi-embed-url' attribute
     * and automatically attempts to embed a powerbi component based on information from the attributes.
     * Only runs if `config.autoEmbedOnContentLoaded` is true when the service is created.
     */
    init(container?: HTMLElement, config: embed.IEmbedConfiguration = undefined): embed.Embed[] {
        container = (container && container instanceof HTMLElement) ? container : document.body;
        
        const elements = Array.prototype.slice.call(container.querySelectorAll(`[${embed.Embed.embedUrlAttribute}]`));
        return elements.map(element => this.embed(element, config));
    }
    
    /**
     * Given an html element embed component based on configuration.
     * If component has already been created and attached to element re-use component instance and existing iframe,
     * otherwise create a new component instance
     */
    embed(element: HTMLElement, config: embed.IEmbedConfiguration = {}): embed.Embed {
        let component: embed.Embed;
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
    private embedNew(element: IPowerBiElement, config: embed.IEmbedConfiguration): embed.Embed {
        const componentType = config.type || element.getAttribute(embed.Embed.typeAttribute);
        if (!componentType) {
            throw new Error(`Attempted to embed using config ${JSON.stringify(config)} on element ${element.outerHTML}, but could not determine what type of component to embed. You must specify a type in the configuration or as an attribute such as '${embed.Embed.typeAttribute}="${Report.type.toLowerCase()}"'.`);
        }
        
        // Save type on configuration so it can be referenced later at known location
        config.type = componentType;
        
        const Component = utils.find(component => componentType === component.type.toLowerCase(), Service.components);
        if (!Component) {
            throw new Error(`Attempted to embed component of type: ${componentType} but did not find any matching component.  Please verify the type you specified is intended.`);
        }

        const component = new Component(this, this.hpmFactory, element, config);
        element.powerBiEmbed = component;
        this.embeds.push(component);
        
        return component;
    }
    
    private embedExisting(element: IPowerBiElement, config: embed.IEmbedConfiguration): embed.Embed {
        const component = utils.find(x => x.element === element, this.embeds);
        if (!component) {
            throw new Error(`Attempted to embed using config ${JSON.stringify(config)} on element ${element.outerHTML} which already has embedded comopnent associated, but could not find the existing comopnent in the list of active components. This could indicate the embeds list is out of sync with the DOM, or the component is referencing the incorrect HTML element.`);
        }
        
        component.load(<embed.IInternalEmbedConfiguration>config);
        
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
     * Find embed instance by name / unique id provided.
     */
    find(uniqueId: string): Report | Tile {
        return utils.find(x => x.config.uniqueId === uniqueId, this.embeds);
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
        utils.remove(x => x === powerBiElement.powerBiEmbed, this.embeds);
        /** Delete property from html element */
        delete powerBiElement.powerBiEmbed;
        /** Remove iframe from element */
        const iframe = element.querySelector('iframe');
        if(iframe) {
            iframe.remove();
        }
    }

    handleEvent(event: IEvent<any>): void {
        const embed = utils.find(embed => {
            const config = embed.getConfig();
            return (config.type === event.type
                && config.uniqueId === event.id);
        }, this.embeds);

        if(embed) {
            embed.handleEvent(event);
        }
    }

    /**
     * Translate target into url
     * Target may be to the whole report, speific page, or specific visual
     */
    private getTargetUrl(target?: models.IPageTarget | models.IVisualTarget): string {
        let targetUrl;

        /**
         * TODO: I mentioned this issue in the protocol test, but we're tranlating targets from objects
         * into parts of the url, and then back to objects. It is a trade off between complixity in this code vs semantic URIs
         * 
         * We could come up with a different idea which passed the target as part of the body
         */
        if(!target) {
            targetUrl = '/report';
        }
        else if(target.type === "page") {
            targetUrl = `/report/pages/${(<models.IPageTarget>target).name}`;
        }
        else if(target.type === "visual") {
            targetUrl = `/report/visuals/${(<models.IVisualTarget>target).id}`;
        }
        else {
            throw new Error(`target.type must be either 'page' or 'visual'. You passed: ${target.type}`);
        }

        return targetUrl;
    }
}