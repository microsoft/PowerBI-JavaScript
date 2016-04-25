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
                '<div powerbi-embed-url="https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123" powerbi-type="report"></div>',
                '<div powerbi-embed-url="https://app.powerbi.com/embed?dashboardId=D1&tileId=T1" powerbi-type="tile"></div>'
            ];

            elements.forEach(element => {
                $(element).appendTo('#powerbi-fixture');
            });

            powerbi.init();

            var iframes = document.querySelectorAll('[powerbi-embed-url] iframe');
            expect(iframes.length).toEqual(2);
        });
    });
    
    describe('get', function () {
        it('if attempting to get a powerbi component on an element which was not embedded, throw an error', function () {
            // Arrange
            const component = $('<div></div>');
            
            // Act
            const attemptGet = () => {
                powerbi.get(component[0]);
            };
            
            // Assert
            expect(attemptGet).toThrowError(Error);
        });
        
        it('calling get on element with embeded component returns the instance', function () {
            // Arrange
            const $element = $('<div powerbi-type="report" powerbi-embed-url="https://app.powerbi.com/reportEmbed?reportId=ABC123"></div>')
                .appendTo('#powerbi-fixture');
            
            const componentInstance = powerbi.embed($element[0]);
            
            // Act
            const componentInstance2 = powerbi.get($element[0]);
            
            // Assert
            expect(componentInstance).toEqual(componentInstance2);
        })
    });

    describe('embed', function () {
        it('if attempting to embed without specifying a type, throw error', function () {
            // Arrange
            const component = $('<div></div>')
                .appendTo('#powerbi-fixture');
            
            // Act
            const attemptEmbed = () => {
                powerbi.embed(component[0]);
            };
            
            // Assert
            expect(attemptEmbed).toThrowError(Error);
        });
        
        it('if attempting to embed with an unknown type, throw error', function () {
            // Arrange
            const component = $('<div powerbi-type="unknownType"></div>')
                .appendTo('#powerbi-fixture');
            
            // Act
            const attemptEmbed = () => {
                powerbi.embed(component[0]);
            };
            
            // Assert
            expect(attemptEmbed).toThrowError(Error);
        });
        
        it('if attempting to embed without specifying an embed url, throw error', function () {
            // Arrange
            const component = $('<div></div>')
                .appendTo('#powerbi-fixture');
            
            // Act
            const attemptEmbed = () => {
                powerbi.embed(component[0], { type: "report" });
            };
            
            // Assert
            expect(attemptEmbed).toThrowError(Error);
        });
        
        it('if attempting to embed without specifying an access token, throw error', function () {
            // Arrange
            const component = $('<div></div>')
                .appendTo('#powerbi-fixture');
            
            const originalToken = powerbi.accessToken;
            powerbi.accessToken = undefined;
            
            // Act
            const attemptEmbed = () => {
                powerbi.embed(component[0], { type: "report", embedUrl: "embedUrl" });
            };
            
            // Assert
            expect(attemptEmbed).toThrowError(Error);
            
            // Cleanup
            powerbi.accessToken = originalToken;
        });
        
        it('if component is already embedded in element re-use the existing component by calling load with the new information', function () {
            // Arrange
            const $element = $('<div powerbi-embed-url="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-type="report"></div>')
                .appendTo('#powerbi-fixture');

            const component = powerbi.embed($element[0]);
            spyOn(component, "load");
            
            const testConfiguration = {
                embedUrl: 'fakeUrl',
                id: 'report2'
            };
            
            // Act
            const component2 = powerbi.embed($element[0], testConfiguration);
            
            // Assert
            expect(component.load).toHaveBeenCalledWith(testConfiguration, true);
            expect(component2).toBe(component);
        });
        
        it('if component was not previously created, creates an instance and return it', function () {
            // Arrange
            var component = $('<div powerbi-embed-url="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-type="report"></div>')
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
            var report = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report" powerbi-access-token="${testToken}"></div>`)
                .appendTo('#powerbi-fixture');

            // Act
            window.powerbi.embed(report[0]);

            // Assert
            var reportInstance = window.powerbi.get(report[0]);
            // TODO: Find way to prevent using private method getAccessToken.
            // Need to know what token the report used, but don't have another option?
            // To properly only test public methods but still confirm this we would need to create special iframe which echoed all
            // messages and then we could test what it received
            var accessToken = (<any>reportInstance).getAccessToken();
            
            expect(accessToken).toEqual(testToken);
        });
        
        it("if token is not found by attribute 'powerbi-access-token', fallback to using global", function () {
            // Arrange
            var embedUrl = 'https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123';
            var testToken = "fakeToken1";
            var report = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report"></div>`)
                .appendTo('#powerbi-fixture');

            var originalToken = window.powerbi.accessToken;
            window.powerbi.accessToken = testToken;

            // Act
            window.powerbi.embed(report[0]);

            // Assert
            var reportInstance = window.powerbi.get(report[0]);
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
                var report = $(`<div powerbi-embed-url="${embedUrl}" powerbi-type="report"></div>`)
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
                var tile = $('<div powerbi-embed-url="' + embedUrl + '" powerbi-type="tile"></div>')
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