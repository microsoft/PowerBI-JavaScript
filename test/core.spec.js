(function () {
    'use strict';

    describe('powerbi', function () {
        beforeAll(function () {
            window.powerbi.accessToken = 'ABC123';
            $('<div id="powerbi-fixture"></div>').appendTo(document.body);
        });

        afterAll(function () {
            $('#powerbi-fixture').remove();
        });

        afterEach(function () {
            $('#powerbi-fixture').empty();
        });

        it('is defined', function () {
            expect(window.powerbi).toBeDefined();
        });

        describe('init', function () {
            it('embeds all components found in the DOM', function () {
                var elements = [
                    '<div powerbi-embed="https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123" powerbi-report></div>',
                    '<div powerbi-embed="https://app.powerbi.com/embed?dashboardId=D1&tileId=T1" powerbi-tile></div>'
                ];

                for (var i = 0; i < elements.length; i++) {
                    $(elements[i]).appendTo('#powerbi-fixture');
                }

                window.powerbi.init();

                var iframes = document.querySelectorAll('[powerbi-embed] iframe');
                expect(iframes.length).toEqual(2);
            });
        });

        describe('embed', function () {
            
            it('if component is already embedded in element and overwrite is FALSE, return the existing component', function () {
                // Arrange
                var component = $('<div powerbi-embed="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-report></div>')
                    .appendTo('#powerbi-fixture');

                var newInstance = powerbi.embed(component[0]);

                // Act
                var instance = powerbi.embed(component[0]);
                
                // Assert
                expect(instance).toBe(newInstance);
            });
            
            it('if component is already embedded in element and overwrite is TRUE, remove the old component and create new component within the elemnt', function () {
                // Arrange
                var component = $('<div powerbi-embed="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-report></div>')
                    .appendTo('#powerbi-fixture');

                var newInstance = powerbi.embed(component[0]);

                // Act
                var instance = powerbi.embed(component[0], { overwrite: true });
                
                // Assert
                expect(instance).not.toBe(newInstance);
                // TODO: Also need to find way to test that newInstance is not still in the private embeds list but we don't have access to it.
                // E.g. expect(powerbi.find(newInstance.options.id)).toBe(undefined);
            });

            it('if component was not previously created, creates an instance and return it', function () {
                // Arrange
                var component = $('<div powerbi-embed="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-report></div>')
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
                var report = $('<div powerbi-embed="' + embedUrl + '" powerbi-report powerbi-access-token="' + testToken + '"></div>')
                    .appendTo('#powerbi-fixture');

                // Act
                window.powerbi.embed(report[0]);

                // Assert
                var reportInstance = window.powerbi.embed(report[0]);
                var accessToken = reportInstance.getAccessToken();
                
                expect(accessToken).toEqual(testToken); 
            });
            
            it("if token is not found by attribute 'powerbi-access-token', fallback to using global", function () {
                // Arrange
                var embedUrl = 'https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123';
                var testToken = "fakeToken1";
                var report = $('<div powerbi-embed="' + embedUrl + '" powerbi-report></div>')
                    .appendTo('#powerbi-fixture');

                var originalToken = window.powerbi.accessToken;
                window.powerbi.accessToken = testToken;

                // Act
                window.powerbi.embed(report[0]);

                // Assert
                var reportInstance = window.powerbi.embed(report[0]);
                var accessToken = reportInstance.getAccessToken();
                
                expect(accessToken).toEqual(testToken);
                
                // Cleanup
                window.powerbi.accessToken = originalToken;
            });
            
            describe('reports', function () {
                it('creates report iframe from embedUrl', function () {
                    var embedUrl = 'https://embedded.powerbi.com/appTokenReportEmbed?reportId=ABC123';
                    var report = $('<div powerbi-embed="' + embedUrl + '" powerbi-report></div>')
                        .appendTo('#powerbi-fixture');

                    window.powerbi.embed(report[0]);

                    var iframe = report.find('iframe');
                    expect(iframe.length).toEqual(1);
                    expect(iframe.attr('src')).toEqual(embedUrl);
                });

                it('creates report iframe from report id', function () {
                    var reportId = 'ABC123';
                    var expectedEmbedUrl = 'https://embedded.powerbi.com/appTokenReportEmbed?reportId=' + reportId;
                    var report = $('<div powerbi-embed powerbi-report="' + reportId + '"></div>')
                        .appendTo('#powerbi-fixture');

                    window.powerbi.embed(report[0]);

                    var iframe = report.find('iframe');
                    expect(iframe.length).toEqual(1);
                    expect(iframe.attr('src')).toEqual(expectedEmbedUrl);
                });
            });

            describe('tiles', function () {
                it('creates tile iframe from embedUrl', function () {
                    var embedUrl = 'https://app.powerbi.com/embed?dashboardId=D1&tileId=T1';
                    var tile = $('<div powerbi-embed="' + embedUrl + '" powerbi-tile></div>')
                        .appendTo('#powerbi-fixture');

                    window.powerbi.embed(tile[0]);

                    var iframe = tile.find('iframe');
                    expect(iframe.length).toEqual(1);
                    expect(iframe.attr('src')).toEqual(embedUrl);
                });

                it('creates tile iframe from dashboard & tile id', function () {
                    var tileId = 'T1';
                    var dashboardId = 'D1';
                    var expectedTileUrl = 'https://app.powerbi.com/embed?dashboardId=' + dashboardId + '&tileId=' + tileId;
                    var tile = $('<div powerbi-embed powerbi-tile="' + tileId + '" powerbi-dashboard="' + dashboardId + '"></div>')
                        .appendTo('#powerbi-fixture');

                    window.powerbi.embed(tile[0]);

                    var iframe = tile.find('iframe');
                    expect(iframe.length).toEqual(1);
                    expect(iframe.attr('src')).toEqual(expectedTileUrl);
                });
            });
        });
    });
} ());