describe("ngmRouting", function () {
    var $, win, $location, scope, errors, $history;

    beforeEach(function () {
        errors = [];
    });

    afterEach(function () {
        expect(errors).toEqual([]);
    });

    function initWithHistorySupport(hash, historySupport, beforeLoadCallback) {
        loadHtml('/jqmng/ui/test-fixture.html' + (hash || ''), function (win) {
            win.onerror = function (event) {
                errors.push(event);
            };
            var ng = win.angular.module("ng");
            ng.config(['$provide', function ($provide) {
                $provide.decorator("$sniffer", ['$delegate', function ($sniffer) {
                    $sniffer.history = historySupport;
                    return $sniffer;
                }]);
            }]);
            $ = win.$;
            if (beforeLoadCallback) {
                beforeLoadCallback(win);
            }
        });
        runs(function () {
            win = testframe();
            var injector = $("body").injector();
            scope = $("body").scope();
            $location = injector.get("$location");
            $history = injector.get("$history");
        });
    }

    describe('history support true', function () {
        function init(hash) {
            initWithHistorySupport(hash, true);
        }

        describe('initial page', function () {

            it('should be able to start at an internal subpage', function () {
                init('#/test-fixture.html#page2');
                waits(500);
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("page2");
                    expect($location.path()).toBe('/test-fixture.html');
                    expect($location.hash()).toBe('page2');
                    expect(win.location.pathname).toBe('/jqmng/ui/test-fixture.html');
                });
            });

            it('should be able to start at an external subpage', function () {
                init('#/externalPage.html');
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("externalPage");
                    expect($location.path()).toBe('/externalPage.html');
                    expect($location.hash()).toBe('');
                    expect(win.location.pathname).toBe('/jqmng/ui/externalPage.html');
                });
            });

            it('should be able to start at an internal page when search parameters are used', function () {
                init('?a=b#/test-fixture.html?a=b#page2');
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("page2");
                });
            });

        });

        describe('navigation in the app', function () {
            it('should be able to change to an internal page', function () {
                init();
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("start");
                    $location.hash("page2");
                    scope.$apply();
                });
                waitsForAsync();
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("page2");
                    expect($location.path()).toBe('/test-fixture.html');
                    expect($location.hash()).toBe('page2');
                    expect(win.location.pathname).toBe('/jqmng/ui/test-fixture.html');
                });
            });

            it('should be able to change to external pages', function () {
                init();
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("start");
                    $location.path("/externalPage.html");
                    scope.$apply();
                });
                waitsForAsync();
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("externalPage");
                    expect($location.path()).toBe('/externalPage.html');
                    expect($location.hash()).toBe('');
                    expect(win.location.pathname).toBe('/jqmng/ui/externalPage.html');
                });
            });

            it('should load external pages without changing the base tag but adjusting link urls', function () {
                var startUrl;
                init();
                runs(function () {
                    startUrl = win.location.href;
                    expect($.mobile.activePage.attr("id")).toBe("start");
                    $location.path("/someFolder/externalPage.html");
                    scope.$apply();
                });
                waitsForAsync();
                runs(function () {
                    expect(win.location.pathname).toBe('/jqmng/ui/someFolder/externalPage.html');
                    expect($("base").attr("href")).toBe(startUrl);
                    expect($("#basePageLink").prop("href")).toBe(startUrl);
                });
            });
        });
    });

    describe('history support false', function () {
        function init(hash) {
            initWithHistorySupport(hash, false);
        }

        describe('initial page', function () {

            it('should be able to start at an internal subpage', function () {
                init('#/test-fixture.html#page2');
                waits(500);
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("page2");
                    expect($location.path()).toBe('/test-fixture.html');
                    expect($location.hash()).toBe('page2');
                    expect(win.location.pathname).toBe('/jqmng/ui/test-fixture.html');
                });
            });

            it('should be able to start at an external subpage', function () {
                init('#/externalPage.html');
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("externalPage");
                    expect($location.path()).toBe('/externalPage.html');
                    expect($location.hash()).toBe('');
                    expect(win.location.pathname).toBe('/jqmng/ui/test-fixture.html');
                });
            });

            it('should be able to start at an internal page when search parameters are used', function () {
                init('?a=b#/test-fixture.html?a=b#page2');
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("page2");
                });
            });

        });

        describe('navigation in the app', function () {
            it('should be able to change to an internal page', function () {
                init();
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("start");
                    $location.hash("page2");
                    scope.$apply();
                });
                waitsForAsync();
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("page2");
                    expect($location.path()).toBe('');
                    expect($location.hash()).toBe('page2');
                    expect(win.location.pathname).toBe('/jqmng/ui/test-fixture.html');
                });
            });

            it('should be able to change to external pages', function () {
                init();
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("start");
                    $location.path("/externalPage.html");
                    scope.$apply();
                });
                waitsForAsync();
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("externalPage");
                    expect($location.path()).toBe('/externalPage.html');
                    expect($location.hash()).toBe('');
                    expect(win.location.pathname).toBe('/jqmng/ui/test-fixture.html');
                });
            });
        });
    });

    describe('$location.back', function () {
        it('should go back in history when $location.back is used', function () {
            initWithHistorySupport('#/test-fixture.html#start', true);
            waits(500);
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("start");
                $location.hash('page2');
                scope.$apply();
            });
            waitsForAsync();
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("page2");
                $location.hash("start");
                $location.backMode();
                scope.$apply();
            });
            waitsForAsync();
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("start");
                $history.go(1);
            });
            waitsForAsync();
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("page2");
            });
        });
    });

    describe('onActivate', function () {
        function visitPage(page, Page2Controller, attrs) {
            initWithHistorySupport(page, true, function (frame) {
                var page = $('#page2');
                page.attr("ng-controller", "Page2Controller");
                frame.Page2Controller = Page2Controller;
                if (attrs) {
                    for (var attr in attrs) {
                        page.attr(attr, attrs[attr]);
                    }
                }
            });
        }

        it("should call the onActivate function on the target page before the pagebeforeshow event", function () {
            var onActivateArguments, onActivateArgumentsOnBeforeShow,
                expectedArgs = {a:2};
            var beforeShowCallCount = 0;
            visitPage("#/test-fixture.html#start", function ($scope) {
                $scope.onActivate = function (locals) {
                    onActivateArguments = locals;
                };
                $scope.onBeforeShow = function () {
                    beforeShowCallCount++;
                    onActivateArgumentsOnBeforeShow = onActivateArguments;
                }
            }, {'ngm-pagebeforeshow':"onBeforeShow()"});
            runs(function () {
                beforeShowCallCount = 0;
                onActivateArgumentsOnBeforeShow = undefined;
                expect(onActivateArguments).toBeUndefined();
                expect(onActivateArgumentsOnBeforeShow).toBeUndefined();
                $location.hash('page2');
                $location.routeOverride({
                    onActivate:'onActivate',
                    locals:expectedArgs
                });
                scope.$apply();
            });
            waitsForAsync();
            runs(function () {
                expect(onActivateArguments).toEqual(expectedArgs);
                expect(onActivateArgumentsOnBeforeShow).toBe(onActivateArguments);
                expect(beforeShowCallCount).toBe(1);
            });
        });

        it("should call the given function on the target page on back navigation", function () {
            var onActivateArguments,
                expectedArgs = {a:2};
            visitPage("#/test-fixture.html#page2", function ($scope) {
                $scope.onActivate = function (locals) {
                    onActivateArguments = locals;
                }
            });
            runs(function () {
                $location.hash("start");
                scope.$apply();
            });
            waitsForAsync();
            runs(function () {
                expect(onActivateArguments).toBeFalsy();
                $location.goBack();
                $location.routeOverride({
                    onActivate:'onActivate',
                    locals:expectedArgs
                });
                scope.$apply();
            });
            waitsForAsync();
            runs(function () {
                expect(onActivateArguments).toEqual(expectedArgs);
            });
        });

    });

    describe('vclick events on empty anchor tags', function () {
        var el;

        function init(hrefValue) {
            initWithHistorySupport('#/test-fixture.html#start', true, function (win) {
                win.$("#start").append('<div data-role="content"><a href="' + hrefValue + '" id="link"></a></div>');
                el = win.$("#link");
            });
        }

        it('should execute a vclick handler when a click event occurs on empty links', function () {
            init("");
            runs(function () {
                var spy = jasmine.createSpy('vclick');
                el.bind('vclick', spy);
                el.trigger('click');
                expect(spy).toHaveBeenCalled();
            });
        });

        it('should execute a vclick handler when a click event occurs on links with href="#"', function () {
            init("#");
            runs(function () {
                var spy = jasmine.createSpy('vclick');
                el.bind('vclick', spy);
                el.trigger('click');
                expect(spy).toHaveBeenCalled();
            });
        });

        it('should execute a vclick handler when a click event occurs on a link with a filled href attribute', function() {
            init("#someHash");
            runs(function () {
                var spy = jasmine.createSpy('vclick');
                el.bind('vclick', spy);
                el.trigger('click');
                expect(spy).toHaveBeenCalled();
            });

        });

        it('should not update $location nor window.location when an empty link is clicked', function () {
            init("");
            runs(function () {
                $location.hash('someHash');
                scope.$apply();
                el.trigger('click');
                expect($location.hash()).toBe('someHash');
            });
        });

        it('should not update $location nor window.location when a link with href="#" is clicked', function () {
            init("#");
            runs(function () {
                $location.hash('someHash');
                scope.$apply();
                el.trigger('click');
                expect($location.hash()).toBe('someHash');
            });
        });

        it('should update $location if a link with a filled href attribute is clicked', function() {
            init("#someHash2");
            runs(function () {
                $location.hash('someHash');
                scope.$apply();
                el.trigger('click');
                expect($location.hash()).toBe('someHash2');
            });

        });
    });

});
