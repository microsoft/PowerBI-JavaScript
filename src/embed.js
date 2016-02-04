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
            var computedStle = window.getComputedStyle(this.element);

            var initEventArgs = {
                message: {
                    action: this.options.loadAction,
                    accessToken: powerbi.accessToken,
                    width: computedStle.width,
                    height: computedStle.height
                }
            };

            powerbi.utils.raiseCustomEvent(this.element, 'embed-init', initEventArgs);
            this.iframe.contentWindow.postMessage(JSON.stringify(initEventArgs.message), '*');
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
            return document.fullscreenElement === this.iframe || document.webkitFullscreenElement === this.iframe || document.mozFullscreenScreenElement === this.iframe || document.msFullscreenElement === this.iframe;
        }
    };
} (window.powerbi = window.powerbi || {}));