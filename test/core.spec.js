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
                    '<div powerbi-embed="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-report></div>',
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

        describe('get', function () {
            it('gets an instance of an already embedded component', function () {
                var component = $('<div powerbi-embed="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-report></div>')
                    .appendTo('#powerbi-fixture');

                window.powerbi.embed(component[0]);

                var instance = window.powerbi.get(component[0]);
                expect(instance).toBeDefined();
                expect(instance instanceof window.powerbi.Report).toBe(true);
            });

            it('creates and instance and returns it when it was note previously created', function () {
                var component = $('<div powerbi-embed="https://app.powerbi.com/reportEmbed?reportId=ABC123" powerbi-report></div>')
                    .appendTo('#powerbi-fixture');

                var instance = window.powerbi.get(component[0]);
                expect(instance).toBeDefined();
                expect(instance instanceof window.powerbi.Report).toBe(true);
            });
        });

        describe('embed', function () {
            describe('reports', function () {
                it('creates report iframe from embedUrl', function () {
                    var embedUrl = 'https://app.powerbi.com/reportEmbed?reportId=ABC123';
                    var report = $('<div powerbi-embed="' + embedUrl + '" powerbi-report></div>')
                        .appendTo('#powerbi-fixture');

                    window.powerbi.embed(report[0]);

                    var iframe = report.find('iframe');
                    expect(iframe.length).toEqual(1);
                    expect(iframe.attr('src')).toEqual(embedUrl);
                });

                it('creates report iframe from report id', function () {
                    var reportId = 'ABC123';
                    var expectedEmbedUrl = 'https://app.powerbi.com/reportEmbed?reportId=' + reportId;
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

        describe('get', function () {

        });
    });
} ());