var DEBUG = false;

function log(msg) {
  if (DEBUG) {
    var d = new Date();
    console.log('[' + d + ' + ' + d.getMilliseconds() + ' ms] ' + msg + '...');
  }
}

function syncGetJSON(url) {
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

$(function() {
  function ViewModel() {
    jsonCache = { cities: {}, schools: {} }
    
    self = this;
    
    self.enemSubject  = ko.observable();
    self.year         = ko.observable();
    self.state        = ko.observable();
    self.cityId       = ko.observable();
    self.cityName     = ko.observable();
    self.schoolId     = ko.observable();
    self.schoolName   = ko.observable();

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

        var schoolSeriesData, dataSource = [], cityTotal = 0.0, schoolTotal = 0.0, json, cacheKey = [self.enemSubject(), self.year(), self.schoolId()];
      
        if (!self.schoolId()) { log('returning'); return; }

        if (cacheKey in jsonCache.schools) {
          json = jsonCache.schools[cacheKey];
        } else {
          // Get the selected school data series.
          json = syncGetJSON('/schools/' + self.schoolId() + '/aggregated_scores/' + self.year() + '/' + self.enemSubject() + '.json');
          jsonCache.schools[cacheKey] = json;
        }
        
        schoolSeriesData = json;

        // Show the chart, since it will be hidden when the page first loads.
        $('#chartContainer').show();

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

  viewModel = new ViewModel();
  ko.applyBindings(viewModel);
});
