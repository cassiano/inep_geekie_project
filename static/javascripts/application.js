(function() {
    var DEBUG = true;

    // KO's custom bindings
    // --------------------

    ko.bindingHandlers.fadeVisible = {
        init: function(element, valueAccessor) {
            var display = ko.unwrap(valueAccessor()); 

            // Start visible/invisible according to initial value.
            $(element).toggle(display);
        },
        update: function(element, valueAccessor, allBindingsAccessor) {
            var display = ko.unwrap(valueAccessor()), allBindings = allBindingsAccessor();
            var duration = allBindings.duration || 400;     // 400 ms is default duration unless otherwise specified.

            // On update, fade in/out.
            display ? $(element).fadeIn(duration) : $(element).fadeOut(duration);
        } 
    };

    ko.bindingHandlers.autocomplete = {
        init: function(element, valueAccessor) {
            var options = ko.unwrap(valueAccessor());
            var defaultJqueryUIOptions = {
                minLength: 3,
                autoFocus: true
            }
            
            $(element).autocomplete(
                $.extend(defaultJqueryUIOptions, options.jqueryUIOptions || {}, {
                    source: function(request, response) {
                        cachedGetJSON(
                            options.url(), 
                            { term: request.term }, 
                            function(data) { response(options.jsonRoot ? data[options.jsonRoot] : data); }
                        );
                    },
                    select: function(event, ui) {
                        options.updateCallback(ui.item.id, ui.item.value);
                    },
                    change: function(event, ui) {
                        // Reset viewModel's autocomplete data on invalid changes.
                        if (ui.item == null) options.updateCallback(undefined, undefined);
                    }
                })
            );
        }
    };

    // Utility functions
    // -----------------

    function log(msg) {
        if (DEBUG && console && console.log) {
            var d = new Date();
            console.log('[' + d + ' + ' + d.getMilliseconds() + ' ms] ' + msg + '...');
        }
    }

    var jsonCache = {};

    function cachedGetJSON() {
        var url = arguments[0], data = {}, success;
        
        if (arguments.length == 2 && typeof arguments[1] == 'function') {
            success = arguments[1];
        } else if (arguments.length == 3 && typeof arguments[1] == 'object' && typeof arguments[2] == 'function') {
            data    = arguments[1];
            success = arguments[2];
        } else {
            throw new Error('Invalid arguments passed to cachedGetJSON()');
        }
        
        var cacheKey = url + ', ' + JSON.stringify(data);
        
        if (cacheKey in jsonCache) {
            log('Getting JSON from cache');

            success(jsonCache[cacheKey]);
        } else {
            log('Doing Ajax request for URL ' + url + ' with parameters ' + JSON.stringify(data))
            
            $.getJSON(url, data, function(innerData, textStatus, jqXHR) {
                log('Saving JSON in cache');
                jsonCache[cacheKey] = innerData;
                success(innerData, textStatus, jqXHR);
            });
        }
    }

    // KO View Model definition
    // ------------------------
    //
    function ViewModel() {
        self = this;

        // Helper functions
        // ----------------
        //
        self.helpers = {
            resetCity: function() {
                $('#city').val('');

                self.helpers.autocomplete.updateCity(undefined, undefined);
            },

            resetSchool: function() {
                $('#school').val('');

                self.helpers.autocomplete.updateSchool(undefined, undefined);
            },

            autocomplete: {
                updateCity: function(id, name) {
                    self.autocomplete.data.city.id(id);
                    self.autocomplete.data.city.name(name);
                },

                updateSchool: function(id, name) {
                    self.autocomplete.data.school.id(id);
                    self.autocomplete.data.school.name(name);
                }
            }
        };

        // Observables mapped directly to form fields
        // ------------------------------------------
        //
        self.enemSubject = ko.observable();
        self.year        = ko.observable();
        self.state       = ko.observable();

        self.enemSubjects = [
            { value: 'NAT', name: 'Ciências da Natureza' },
            { value: 'HUM', name: 'Ciências Humanas' },
            { value: 'LAN', name: 'Linguagens e Códigos' },
            { value: 'MAT', name: 'Matemática' }
        ];
        
        // Autocomplete data and options
        // -----------------------------
        //
        self.autocomplete = {
            // Observables managed by autocomplete, using helper functions
            // -----------------------------------------------------------
            data: {
                city: {
                    id: ko.observable(),
                    name: ko.observable()
                },
                school: {
                    id: ko.observable(),
                    name: ko.observable()
                },
            },
            options: {
                city: {
                    url: function() { return '/states/' + self.state() + '/cities/search.json' },
                    jsonRoot: 'cities', 
                    updateCallback: self.helpers.autocomplete.updateCity,
                    jqueryUIOptions: {}
                },
                school: {
                    url: function() { return '/cities/' + self.autocomplete.data.city.id() + '/schools/search.json' }, 
                    jsonRoot: 'schools', 
                    updateCallback: self.helpers.autocomplete.updateSchool,
                    jqueryUIOptions: {}
                }
            }
        };

        // Chart data
        // ----------

        self.chart = {
            // Observables managed by updater computed functions (see below)
            // -------------------------------------------------------------
            //
            data: {
                series: {
                    school: ko.observable(),
                    city: ko.observable()
                },
                source: ko.observable()
            }
        };

        // Chart options
        // -------------
        //
        self.chart.options = {
            dataSource: self.chart.data.source,

            series: ko.computed(function() {
                log('Series being updated');

                return [
                    { valueField: 'school', name: self.autocomplete.data.school.name() },
                    { valueField: 'city',   name: 'Média da cidade de ' + self.autocomplete.data.city.name() + '-' + self.state() }
                ];
            }),

            commonSeriesSettings: {
                argumentField: 'scoreRange',
                type: 'bar',
                label:{
                    visible: true,
                    format: "fixedPoint",
                    precision: 1
                }
            },

            title: ko.computed(function() { 
                if (self.enemSubject()) 
                    return { text: 'Histograma - ' + self.enemSubject().name + ' - ' + self.year() }
            }),

            legend: {
                verticalAlignment: 'bottom',
                horizontalAlignment: 'center'
            }            
        };

        // chart.data.series.school updater
        // --------------------------------
        //
        ko.computed(function() {
            log('School data series being refreshed');
        
            // Reset school series data.
            self.chart.data.series.school(undefined);

            // Return if no school selected.
            if (!self.autocomplete.data.school.id()) { 
                log('No school selected. Returning'); 
                return; 
            }
        
            cachedGetJSON(
                '/schools/' + self.autocomplete.data.school.id() + '/aggregated_scores/' + self.year() + '/' + self.enemSubject().value + '.json', 
                self.chart.data.series.school       // Update the observable when the Ajax call has completed.
            );
        });

        // chart.data.series.city updater
        // ------------------------------
        //
        ko.computed(function() {
            log('City data series being refreshed');

            // Reset city series data.
            self.chart.data.series.city(undefined);

            // Return if no city selected.
            if (!self.autocomplete.data.city.id()) { 
                log('No city selected. Returning'); 
                return; 
            }

            cachedGetJSON(
                '/cities/' + self.autocomplete.data.city.id() + '/aggregated_scores/' + self.year() + '/' + self.enemSubject().value + '.json', 
                self.chart.data.series.city     // Update the observable when the Ajax call has completed.
            );
        });

        // chart.data.source updater
        // -------------------------
        //
        ko.computed(function() {
            log('Data source being updated');
        
            // Return if either school or city series data is unavailable.
            if (!self.chart.data.series.school() || !self.chart.data.series.city()) { 
                log('Either school or city series data is unavailable. Returning'); 
                self.chart.data.source(undefined);      // Reset data source.
                return; 
            }

            // Calculate totals.
            var totals = { school: 0.0, city: 0.0 };
            $.each(self.chart.data.series.school(), function() { totals.school += this; });
            $.each(self.chart.data.series.city(),   function() { totals.city   += this; });

            // Format the data source.
            var dataSource = [];
            for (var i = 0; i < 10; i++) {
                dataSource[i] = {
                    scoreRange: i + '-' + (i + 1), 
                    school: totals.school > 0 ? ((self.chart.data.series.school()[i + 1] || 0) / totals.school) * 100.0 : 0.0,
                    city:   totals.city   > 0 ? ((self.chart.data.series.city()  [i + 1] || 0) / totals.city)   * 100.0 : 0.0
                }
            }

            self.chart.data.source(dataSource);
        });

        // Manual subscriptions
        // --------------------

        // Whenever state is changed, reset and move focus to city.
        self.state.subscribe(function(value) { 
            self.helpers.resetCity();
            setTimeout(function() { $('#city').focus(); }, 200);
        });

        // Whenever city is changed, reset and move focus to school.
        self.autocomplete.data.city.id.subscribe(function(value) { 
            self.helpers.resetSchool();
            setTimeout(function() { $('#school').focus(); }, 200);
        });
    };

    // KO initialization
    // -----------------
    //
    $(function() {
        var viewModel = new ViewModel();
        ko.applyBindings(viewModel);
    });
})();
