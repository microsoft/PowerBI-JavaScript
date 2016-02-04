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