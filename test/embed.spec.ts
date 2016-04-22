import PowerBi from '../src/core';

declare var powerbi: PowerBi;

describe('embed', function () {
    var container = null;
    var iframe = null;

    beforeEach(function () {
        container = $('<div powerbi-embed-url="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-type="report"></div>')
            .appendTo('#powerbi-fixture');

        powerbi.embed(container[0]);
        iframe = container.find('iframe');
    });

    beforeAll(function () {
        powerbi.accessToken = 'ABC123';
        $('<div id="powerbi-fixture"></div>').appendTo(document.body);
    });

    afterAll(function () {
        $('#powerbi-fixture').remove();
    });

    afterEach(function () {
        $('#powerbi-fixture').empty();
    });

    describe('iframe', function () {
        it('has a src', function () {
            expect(iframe.attr('src').length).toBeGreaterThan(0);
        });

        it('disables scrollbars by default', function () {
            expect(iframe.attr('scrolling')).toEqual('no');
        });

        it('sets width/height to 100%', function () {
            expect(iframe[0].style.width).toEqual('100%');
            expect(iframe[0].style.height).toEqual('100%');
        });
    });

    describe('fullscreen', function () {
        it('sets the iframe as the fullscreen element', function () {
            var report = powerbi.get(container[0]);
            report.fullscreen();

            expect(document.webkitFullscreenElement === iframe);
        });
    });

    describe('exitFullscreen', function () {
        it('clears the iframe fullscreen element', function () {
            var report = powerbi.get(container[0]);
            report.fullscreen();
            report.exitFullscreen();

            expect(document.webkitFullscreenElement !== iframe);
        });
    });
});