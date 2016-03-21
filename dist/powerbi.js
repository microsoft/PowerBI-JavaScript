(function (powerbi) {
    'use strict';

    powerbi.Embed = Embed;

    function Embed() { }

    Embed.prototype = {
        init: function () {
            var embedUrl = this.getEmbedUrl();
            var iframeHtml = '<iframe style="width:100%;height:100%;" src="' + embedUrl + '" scrolling="no" allowfullscreen="true"></iframe>';
            this.element.innerHTML = iframeHtml;
            this.iframe = this.element.childNodes[0];
            this.iframe.addEventListener('load', this.load.bind(this), false);
        },
        load: function () {
            var computedStyle = window.getComputedStyle(this.element);
            var accessToken = this.getAccessToken();
            
            var initEventArgs = {
                message: {
                    action: this.options.loadAction,
                    accessToken: accessToken,
                    width: computedStyle.width,
                    height: computedStyle.height
                }
            };

            powerbi.utils.raiseCustomEvent(this.element, 'embed-init', initEventArgs);
            this.iframe.contentWindow.postMessage(JSON.stringify(initEventArgs.message), '*');
        },
        getAccessToken: function () {
            var accessToken = this.element.getAttribute('powerbi-access-token');

            if (!accessToken) {
                accessToken = powerbi.accessToken;
                
                if (!accessToken) {
                    throw new Error("No access token was found for element. You must specify an access token directly on the element using attribute 'powerbi-access-token' or specify a global token at: powerbi.accessToken.");
                }
            }

            return accessToken;
        },
        getEmbedUrl: function () {
            return this.element.getAttribute('powerbi-embed');
        },
        fullscreen: function () {
            var elem = this.iframe;

            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            }
        },
        exitFullscreen: function () {
            if (!this.isFullscreen()) {
                return;
            }

            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        },
        isFullscreen: function () {
            var options = ['fullscreenElement', 'webkitFullscreenElement', 'mozFullscreenScreenElement', 'msFullscreenElement'];
            for (var i = 0; i < options.length; i++) {
                if (document[options[i]] === this.iframe) {
                    return true;
                }
            }

            return false;
        }
    };
} (window.powerbi = window.powerbi || {}));
(function(powerbi){
    'use strict';
    
    powerbi.Tile = Tile;
    powerbi.Tile.prototype = powerbi.Embed.prototype;
    
    function Tile(element, options) {
        var me = this;
        
        this.element = element;
        this.options = options || {};
        this.options.loadAction = 'loadTile';
        this.getEmbedUrl = getEmbedUrl;

        this.init();

        ///////////////////////////////

        function getEmbedUrl() {
            var embedUrl = powerbi.Embed.prototype.getEmbedUrl.call(me);
            if (!embedUrl) {
                var dashboardId = me.element.getAttribute('powerbi-dashboard');
                var tileId = me.element.getAttribute('powerbi-tile');

                if (!(dashboardId && tileId)) {
                    throw new Error('dashboardId & tileId are required');
                }

                embedUrl = 'https://app.powerbi.com/embed?dashboardId=' + dashboardId + '&tileId=' + tileId;
            }

            return embedUrl;
        }
    }
}(window.powerbi = window.powerbi || {}));
(function(powerbi){
    'use strict';
    
    powerbi.Report = Report;
    powerbi.Report.prototype = powerbi.Embed.prototype;
    
    function Report(element, options) {
        var me = this;
        
        this.element = element;
        this.options = options || {};
        this.options.loadAction = 'loadReport';
        this.getEmbedUrl = getEmbedUrl;

        this.init();

        ///////////////////////////////

        function getEmbedUrl() {
            var embedUrl = powerbi.Embed.prototype.getEmbedUrl.call(me);
            if (!embedUrl) {
                var reportId = me.element.getAttribute('powerbi-report');

                if (!reportId) {
                    throw new Error('reportId is required');
                }

                embedUrl = 'https://app.powerbi.com/reportEmbed?reportId=' + reportId;
            }

            return embedUrl;
        }
    }
}(window.powerbi = window.powerbi || {}));
(function (powerbi) {
    'use strict';
    
    powerbi.utils = {
        raiseCustomEvent: raiseCustomEvent
    };

    function raiseCustomEvent(element, eventName, eventData) {
        var customEvent;
        if (typeof (window.CustomEvent) === 'function') {
            customEvent = new CustomEvent(eventName, {
                detail: eventData,
                bubbles: true,
                cancelable: true
            });
        } else {
            customEvent = document.createEvent('CustomEvent');
            customEvent.initCustomEvent(eventName, true, true, eventData);
        }

        element.dispatchEvent(customEvent);
        if (customEvent.defaultPrevented || !customEvent.returnValue) {
            return;
        }

        var inlineEventAttr = 'on' + eventName.replace('-', '');
        var inlineScript = element.getAttribute(inlineEventAttr);
        if (inlineScript) {
            eval.call(element, inlineScript);
        }
    }
} (window.powerbi = window.powerbi || {}));
(function (powerbi) {
    'use strict';

    var embeds = [];
    var componentTypes = [];

    powerbi.get = get;
    powerbi.embed = embed;
    powerbi.init = init;

    activate();
    
    //////////////////////////////////    
    
    function activate() {
        window.addEventListener('DOMContentLoaded', init, false);
        window.addEventListener('message', onReceiveMessage, false);

        componentTypes = [
            { type: 'powerbi-tile', component: powerbi.Tile },
            { type: 'powerbi-report', component: powerbi.Report }
        ];
    }

    var EmbedEventMap = {
        'tileClicked': 'tile-click',
        'tileLoaded': 'tile-load',
        'reportPageLoaded': 'report-load'
    };

    function init(container) {
        container = (container && container instanceof HTMLElement) ? container : document.body;
        
        var components = container.querySelectorAll('[powerbi-embed]');
        for (var i = 0; i < components.length; i++) {
            embed(components[i]);
        }
    }

    function get(element) {
        return element.powerBIEmbed || embed(element);
    }

    function embed(element) {
        var instance;

        if (element.powerBIEmbed) {
            return element.powerBIEmbed;
        }

        for (var j = 0; j < componentTypes.length; j++) {
            var componentType = componentTypes[j];

            if (element.getAttribute(componentType.type) !== null) {
                instance = new componentType.component(element);
                element.powerBIEmbed = instance;
                embeds.push(instance);
                break;
            }
        }

        return instance;
    }

    function onReceiveMessage(event) {
        if (!event) {
            return;
        }

        try {
            var messageData = JSON.parse(event.data);
            for (var i = 0; i < embeds.length; i++) {
                var embed = embeds[i];

                // Only raise the event on the embed that matches the post message origin
                if (event.source === embed.iframe.contentWindow) {
                    powerbi.utils.raiseCustomEvent(embed.element, EmbedEventMap[messageData.event], messageData);
                }
            }
        }
        catch (e) {
            if (typeof (window.powerbi.onError) === 'function') {
                window.powerbi.onError.call(window, e);
            }
        }
    }
} (window.powerbi = window.powerbi || {}));