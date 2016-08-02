import * as embed from './embed';
import { Report } from './report';
import { Tile } from './tile';
import { Page } from './page';
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

export interface ICustomEvent<T> extends CustomEvent {
    detail: T;
}

export interface IEventHandler<T> {
    (event: ICustomEvent<T>): any;
}

export interface IHpmFactory {
    (wpmp: wpmp.WindowPostMessageProxy, targetWindow?: Window, version?: string, type?: string, origin?: string): hpm.HttpPostMessage;
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
}

export interface IServiceConfiguration extends IDebugOptions {
    autoEmbedOnContentLoaded?: boolean;
    onError?: (error: any) => any;
    version?: string;
    type?: string;
}

export interface IService {
    hpm: hpm.HttpPostMessage;
}

export class Service implements IService {

    /**
     * List of components this service can embed.
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
    /** TODO: Look for way to make this private without sacraficing ease of maitenance. This should be private but in embed needs to call methods. */
    public hpm: hpm.HttpPostMessage;
    public wpmp: wpmp.WindowPostMessageProxy;
    private router: router.Router;

    constructor(hpmFactory: IHpmFactory, wpmpFactory: IWpmpFactory, routerFactory: IRouterFactory, config: IServiceConfiguration = {}) {
        this.wpmp = wpmpFactory(config.wpmpName, config.logMessages);
        this.hpm = hpmFactory(this.wpmp, null, config.version, config.type);
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
        this.router.post(`/reports/:uniqueId/pages/:pageName/visuals/:pageName/events/:eventName`, (req, res) => {
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

        const component = new Component(this, element, config);
        element.powerBiEmbed = component;
        this.embeds.push(component);
        
        return component;
    }
    
    /**
     * Given and element which arleady contains embed, load with new configuration
     */
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

    /**
     * Given an event object, find embed with matching type and id and invoke its handleEvent method with event.
     */
    private handleEvent(event: IEvent<any>): void {
        const embed = utils.find(embed => {
            return (embed.config.type === event.type
                && embed.config.uniqueId === event.id);
        }, this.embeds);

        if(embed) {
            const value = event.value;

            if (event.name === 'pageChanged') {
                const pageKey = 'newPage';
                const page: models.IPage = value[pageKey];
                if (!page) {
                    throw new Error(`Page model not found at 'event.value.${pageKey}'.`);
                }
                value[pageKey] = new Page(embed, page.name, page.displayName);
            }

            utils.raiseCustomEvent(embed.element, event.name, value);
        }
    }
}