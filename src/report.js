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