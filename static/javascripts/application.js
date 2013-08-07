(function() {
  var viewModel, DEBUG = false;

  // ##########################
  // Support functions
  // ##########################

  var log = function(msg) {
    if (DEBUG) {
      var d = new Date();
      console.log('[' + d + ' + ' + d.getMilliseconds() + ' ms] ' + msg + '...');
    }
  }

  var syncGetJSON = function(url) {
    var json;
  
    $.ajax({
      type: 'GET',
      url: url,
      dataType: 'json',
      success: function(data) { json = data; },
      data: {},
      async: false
    });
  
    return json;
  }

  var clearAutocompleteAndViewModelCityData = function() {
    $('#city').val('');

    updateViewModelCityData(null, null);
    clearAutocompleteAndViewModelSchoolData();
  }

  var clearAutocompleteAndViewModelSchoolData = function() {
    $('#school').val('');

    updateViewModelSchoolData(null, null);
  }

  var updateViewModelCityData = function(id, name) {
    viewModel.cityId(id);
    viewModel.cityName(name);
  }

  var updateViewModelSchoolData = function(id, name) {
    viewModel.schoolId(id);
    viewModel.schoolName(name);
  }

  // ##########################
  // View Model definition
  // ##########################

  var ViewModel = function() {
    jsonCache = { cities: {}, schools: {} }
  
    self = this;
  
    self.enemSubject  = ko.observable();
    self.year         = ko.observable();
    self.cityId       = ko.observable();
    self.cityName     = ko.observable();
    self.schoolId     = ko.observable();
    self.schoolName   = ko.observable();

    self.stateValue = ko.observable();
    self.state      = ko.computed({
      read: function() {
        return self.stateValue();
      },
      write: function(value) {
        clearAutocompleteAndViewModelCityData();
        self.stateValue(value);
      }
    });

    self.citySeriesData = ko.computed(function() {
      log('citySeriesData being calculated');
    
      var json, cacheKey = [self.enemSubject(), self.year(), self.cityId()];
    
      if (!self.cityId()) { log('returning'); return; }
    
      if (cacheKey in jsonCache.cities) {
        json = jsonCache.cities[cacheKey];
      } else {
        json = syncGetJSON('/cities/' + self.cityId() + '/aggregated_scores/' + self.year() + '/' + self.enemSubject() + '.json');
        jsonCache.cities[cacheKey] = json;
      }

      return json;
    });

    self.chartOptions = {
      dataSource: ko.computed(function() {
        log('dataSource being calculated...');

        var schoolSeriesData, dataSource = [], cityTotal = 0.0, schoolTotal = 0.0, cacheKey = [self.enemSubject(), self.year(), self.schoolId()];
    
        if (!self.schoolId()) { log('returning'); return; }

        if (cacheKey in jsonCache.schools) {
          schoolSeriesData = jsonCache.schools[cacheKey];
        } else {
          // Get the selected school data series.
          schoolSeriesData = syncGetJSON('/schools/' + self.schoolId() + '/aggregated_scores/' + self.year() + '/' + self.enemSubject() + '.json');
          jsonCache.schools[cacheKey] = schoolSeriesData;
        }

        // Calculate totals.
        $.each(schoolSeriesData,      function(index, value) { schoolTotal  += value })
        $.each(self.citySeriesData(), function(index, value) { cityTotal    += value })

        // Format the data source.
        for (var i = 0; i < 10; i++) {
          dataSource[i] = {
            scoreRange: i + '-' + (i + 1), 
            school: schoolTotal > 0 ? (schoolSeriesData[i]      / schoolTotal || 0) * 100.0 : 0.0,
            city:   cityTotal   > 0 ? (self.citySeriesData()[i] / cityTotal   || 0) * 100.0 : 0.0
          }
        }

        return dataSource;
      }).extend({ throttle: 1 }),   // Use the "throttle" extender so changes to self.enemSubject() or self.year() don't 
                                    // cause this computed observable to be called twice (given it depends on these 2 
                                    // observables and self.citySeriesData(), which in turn also depends on them).
    
      series: ko.computed(function() {
        return [
          { valueField: 'school', name: self.schoolName() },
          { valueField: 'city',   name: 'Média da cidade de ' + self.cityName() }
        ];
      }),

      commonSeriesSettings: {
        argumentField: 'scoreRange',
        type: 'bar',
        label:{
          visible: false,
          format: "fixedPoint",
          precision: 2
        }
      },

      title: { text: 'Histograma de comparação' },    

      legend: {
        verticalAlignment: 'bottom',
        horizontalAlignment: 'center'
      }      
    }
  };

  $(function() {
    // Initialize Knockout.
    viewModel = new ViewModel();
    ko.applyBindings(viewModel);

    // ##########################
    // Autocompletes
    // ##########################

    var autocompleteCache = { cities: {}, schools: {} };
  
    $('#city').autocomplete({
      minLength: 3,
      source: function(request, response) {
        var term = request.term;
        var state = viewModel.state();

        if (term in (autocompleteCache.cities[state] || {})) {
          response(autocompleteCache.cities[state][term]);
          return;
        }

        $.getJSON('/states/' + state + '/cities/search.json', request, function(data, status, xhr) {
          autocompleteCache.cities[state]       = autocompleteCache.cities[state] || {};
          autocompleteCache.cities[state][term] = data.cities;

          response(autocompleteCache.cities[state][term]);
        });
      },
      select: function(event, ui) {
        // Clear the school (autocomplete) input text and the view model's school (ID and name).
        clearAutocompleteAndViewModelSchoolData();

        // Update the view model's city (ID and name).
        updateViewModelCityData(ui.item.id, ui.item.value);
      }
    });

    $('#school').autocomplete({
      minLength: 3,
      source: function(request, response) {
        var term   = request.term;
        var cityId = viewModel.cityId();

        if (term in (autocompleteCache.schools[cityId] || {})) {
          response(autocompleteCache.schools[cityId][term]);
          return;
        }

        $.getJSON('/schools/search/' + cityId + '.json', request, function(data, status, xhr) {
          autocompleteCache.schools[cityId]       = autocompleteCache.schools[cityId] || {};
          autocompleteCache.schools[cityId][term] = data.schools;

          response(autocompleteCache.schools[cityId][term]);
        });
      },
      select: function(event, ui) {
        // Update the view model's school (id and name).
        updateViewModelSchoolData(ui.item.id, ui.item.value);
      }
    });
  });
})();
