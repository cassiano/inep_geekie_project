(function() {
  var DEBUG = true;

  // ##################################
  // Utility functions
  // ##################################

  var log = function(msg) {
    if (DEBUG && console) {
      var d = new Date();
      console.log('[' + d + ' + ' + d.getMilliseconds() + ' ms] ' + msg + '...');
    }
  }

  var jsonCache = {};
  var cachedGetJSON = function(url, params, callback) {
    var cacheKey = url + ', ' + JSON.stringify(params);
    
    if (cacheKey in jsonCache) {
      log('Getting JSON from cache');
      callback(jsonCache[cacheKey]);
    } else {
      $.getJSON(url, params, function(data) {
        log('Saving JSON in cache');
        jsonCache[cacheKey] = data;
        callback(data);
      });
    }
  }

  // ##################################
  // View Model definition
  // ##################################

  var ViewModel = function() {
    self = this;
  
    self.enemSubject = ko.observable();
    self.year        = ko.observable();
    self.state       = ko.observable();
    
    self.autocomplete = {
      city: {
        id: ko.observable(),
        name: ko.observable()
      },
      school: {
        id: ko.observable(),
        name: ko.observable()
      }
    }

    self.chart = {
      data: {
        series: {
          school: ko.observable(),
          city: ko.observable()
        },
        
        source: ko.observable()
      },

      series: ko.computed(function() {
        return [
          { valueField: 'school', name: self.autocomplete.school.name() },
          { valueField: 'city',   name: 'Média da cidade de ' + self.autocomplete.city.name() }
        ];
      })
    }

    self.chart.options = {
      dataSource: ko.computed(self.chart.data.source),

      series: ko.computed(self.chart.series),

      commonSeriesSettings: {
        argumentField: 'scoreRange',
        type: 'bar',
        label:{
          visible: true,
          format: "fixedPoint",
          precision: 1
        }
      },

      title: { text: 'Histograma de comparação' },    

      legend: {
        verticalAlignment: 'bottom',
        horizontalAlignment: 'center'
      }      
    }

    // ##################################
    // Chart data refreshers
    // ##################################

    // chart.data.series.school
    ko.computed(function() {
      log('Observable chart.data.series.school being refreshed');
    
      // Return if no school selected.
      if (!self.autocomplete.school.id()) { 
        log('No school selected. Returning'); 
        self.chart.data.series.school(undefined);   // Reset school series data.
        return; 
      }
    
      cachedGetJSON(
        '/schools/' + self.autocomplete.school.id() + '/aggregated_scores/' + self.year() + '/' + self.enemSubject() + '.json', 
        {}, 
        self.chart.data.series.school   // Update the observable when the Ajax call has completed.
      );
    });

    // chart.data.series.city
    ko.computed(function() {
      log('Observable chart.data.series.city being refreshed');

      // Return if no city selected.
      if (!self.autocomplete.city.id()) { 
        log('No city selected. returning'); 
        self.chart.data.series.city(undefined);   // Reset city series data.
        return; 
      }

      cachedGetJSON(
        '/cities/' + self.autocomplete.city.id() + '/aggregated_scores/' + self.year() + '/' + self.enemSubject() + '.json', 
        {}, 
        self.chart.data.series.city   // Update the observable when the Ajax call has completed.
      );
    });

    // chart.data.source
    ko.computed(function() {
      log('Observable chart.data.source being calculated');
    
      // Return if either school or city series data is unavailable.
      if (!self.chart.data.series.school() || !self.chart.data.series.city()) { 
        log('Either school or city series data is unavailable. returning'); 
        self.chart.data.source(undefined);    // Reset data source.
        return; 
      }

      // Calculate totals.
      var totals = { school: 0.0, city: 0.0 };
      $.each(self.chart.data.series.school(), function(index, value) { totals.school  += value })
      $.each(self.chart.data.series.city(),   function(index, value) { totals.city    += value })

      // Format the data source.
      var dataSource = [];
      for (var i = 0; i < 10; i++) {
        dataSource[i] = {
          scoreRange: i + '-' + (i + 1), 
          school: totals.school > 0 ? (self.chart.data.series.school()[i + 1] / totals.school || 0) * 100.0 : 0.0,
          city:   totals.city   > 0 ? (self.chart.data.series.city()  [i + 1] / totals.city   || 0) * 100.0 : 0.0
        }
      }

      self.chart.data.source(dataSource);
    }).extend({ throttle: 10 });    // Use the "throttle" extender so changes to self.enemSubject() or self.year() don't 
                                    // cause this computed observable to be called twice (given it depends on these 2 
                                    // observables plus self.chart.data.series.school() and self.chart.data.series.city(),
                                    //  which in turn also depend on them).

    // ##################################
    // Manual subscriptions
    // ##################################

    // Whenever state is changed, reset and move focus to city.
    self.state.subscribe(function(value) { 
      self.helpers.resetCity();
      setTimeout(function() { $('#city').focus(); }, 200);
    });

    // Whenever city is changed, reset and move focus to school.
    self.autocomplete.city.id.subscribe(function(value) { 
      self.helpers.resetSchool();
      setTimeout(function() { $('#school').focus(); }, 200);
    });

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
          self.autocomplete.city.id(id);
          self.autocomplete.city.name(name);
        },

        updateSchool: function(id, name) {
          self.autocomplete.school.id(id);
          self.autocomplete.school.name(name);
        }
      }
    }
  };

  $(function() {
    // Initialize Knockout.
    var viewModel = new ViewModel();
    ko.applyBindings(viewModel);

    // ##################################
    // Autocompletes
    // ##################################

    $('#city').autocomplete({
      minLength: 3,
      source: function(request, response) {
        cachedGetJSON(
          '/states/' + viewModel.state() + '/cities/search.json', 
          { term: request.term }, 
          function(data) { response(data.cities); }
        );
      },
      select: function(event, ui) {
        viewModel.helpers.autocomplete.updateCity(ui.item.id, ui.item.value);
      }
    });

    $('#school').autocomplete({
      minLength: 3,
      source: function(request, response) {
        cachedGetJSON(
          '/cities/' + viewModel.autocomplete.city.id() + '/schools/search.json', 
          { term: request.term }, 
          function(data) { response(data.schools); }
        );
      },
      select: function(event, ui) {
        viewModel.helpers.autocomplete.updateSchool(ui.item.id, ui.item.value);
      }
    });
  });
})();
