import PowerBi from '../src/core';

declare global {
    interface Window {
        powerbi: PowerBi;
    }
}

declare var powerbi: PowerBi;

describe('powerbi', function () {
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

    it('is defined', function () {
        expect(powerbi).toBeDefined();
    });

    describe('init', function () {
        it('embeds all components found in the DOM', function () {
            const elements = [
                '<div powerbi-embed="https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123" powerbi-type="report"></div>',
                '<div powerbi-embed="https://app.powerbi.com/embed?dashboardId=D1&tileId=T1" powerbi-type="tile"></div>'
            ];

            elements.forEach(element => {
                $(element).appendTo('#powerbi-fixture');
            });

            powerbi.init();

            var iframes = document.querySelectorAll('[powerbi-embed] iframe');
            expect(iframes.length).toEqual(2);
        });
    });

    describe('embed', function () {
        
        it('if component is already embedded in element and overwrite is FALSE, return the existing component', function () {
            // Arrange
            var component = $('<div powerbi-embed="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-type="report"></div>')
                .appendTo('#powerbi-fixture');

            var newInstance = window.powerbi.embed(component[0]);

            // Act
            var instance = window.powerbi.embed(component[0]);
            
            // Assert
            expect(instance).toBe(newInstance);
        });
        
        it('if component is already embedded in element and overwrite is TRUE, remove the old component and create new component within the elemnt', function () {
            // Arrange
            var component = $('<div powerbi-embed="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-type="report"></div>')
                .appendTo('#powerbi-fixture');

            var newInstance = window.powerbi.embed(component[0]);

            // Act
            var instance = window.powerbi.embed(component[0], { overwrite: true });
            
            // Assert
            expect(instance).not.toBe(newInstance);
            // TODO: Also need to find way to test that newInstance is not still in the private embeds list but we don't have access to it.
            // E.g. expect(powerbi.find(newInstance.options.id)).toBe(undefined);
        });

        it('if component was not previously created, creates an instance and return it', function () {
            // Arrange
            var component = $('<div powerbi-embed="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-type="report"></div>')
                .appendTo('#powerbi-fixture');

            // Act
            var instance = window.powerbi.embed(component[0]);
            
            // Assert
            expect(instance).toBeDefined();
        });
        
        it("looks for a token first from attribute 'powerbi-access-token'", function () {
            // Arrange
            var embedUrl = 'https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123';
            var testToken = "fakeToken1";
            var report = $(`<div powerbi-embed="${embedUrl}" powerbi-type="report" powerbi-access-token="${testToken}"></div>`)
                .appendTo('#powerbi-fixture');

            // Act
            window.powerbi.embed(report[0]);

            // Assert
            var reportInstance = window.powerbi.embed(report[0]);
            // TODO: Find way to prevent using private method getAccessToken.
            // Need to know what token the report used, but don't have another option?
            var accessToken = (<any>reportInstance).getAccessToken();
            
            expect(accessToken).toEqual(testToken); 
        });
        
        it("if token is not found by attribute 'powerbi-access-token', fallback to using global", function () {
            // Arrange
            var embedUrl = 'https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123';
            var testToken = "fakeToken1";
            var report = $(`<div powerbi-embed="${embedUrl}" powerbi-type="report"></div>`)
                .appendTo('#powerbi-fixture');

            var originalToken = window.powerbi.accessToken;
            window.powerbi.accessToken = testToken;

            // Act
            window.powerbi.embed(report[0]);

            // Assert
            var reportInstance = window.powerbi.embed(report[0]);
            // TODO: Find way to prevent using private method getAccessToken.
            // Need to know what token the report used, but don't have another option?
            var accessToken = (<any>reportInstance).getAccessToken();
            
            expect(accessToken).toEqual(testToken);
            
            // Cleanup
            window.powerbi.accessToken = originalToken;
        });
        
        describe('reports', function () {
            it('creates report iframe from embedUrl', function () {
                var embedUrl = 'https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123';
                var report = $(`<div powerbi-embed="${embedUrl}" powerbi-type="report"></div>`)
                    .appendTo('#powerbi-fixture');

                window.powerbi.embed(report[0]);

                var iframe = report.find('iframe');
                expect(iframe.length).toEqual(1);
                expect(iframe.attr('src')).toEqual(embedUrl);
            });
        });

        describe('tiles', function () {
            it('creates tile iframe from embedUrl', function () {
                var embedUrl = 'https://app.powerbi.com/embed?dashboardId=D1&tileId=T1';
                var tile = $('<div powerbi-embed="' + embedUrl + '" powerbi-type="tile"></div>')
                    .appendTo('#powerbi-fixture');

                window.powerbi.embed(tile[0]);

                var iframe = tile.find('iframe');
                expect(iframe.length).toEqual(1);
                expect(iframe.attr('src')).toEqual(embedUrl);
            });
        });
    });
    
    // TODO: Either find a way to fix the test or remove it.
    // 1. onReceiveMessage is private so it's not supposed to be accessable for testing
    // 2. the window.addEventListener('message', this.onReceiveMessage.bind(this)) prevents the method from being spied on. 
    xdescribe('message handling', function () {
        it('if message is sent to window from embedded iframe, it should be passed to onReceiveMessage', function (done) {
            // Arrange
            spyOn(powerbi, "onReceiveMessage");
            
            // Act
            window.postMessage({ event: 'fakeEvent' }, "*");
            
            // Assert
            setTimeout(() => {
                expect(powerbi['onReceiveMessage']).toHaveBeenCalled();
                done();
            }, 0);
        });
    })
});