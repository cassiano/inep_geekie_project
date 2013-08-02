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
    self = this;
    
		self.enemSubject  = ko.observable();
		self.year         = ko.observable();
    self.state        = ko.observable();
		self.cityId       = ko.observable();
    self.cityName     = ko.observable();
    self.schoolId     = ko.observable();
    self.schoolName   = ko.observable();

    self.citySeriesData = ko.computed(function() {
      if (self.cityId() == undefined || self.year() == undefined || self.enemSubject() == undefined) return;
      
      return syncGetJSON('/cities/' + self.cityId() + '/aggregated_scores/' + self.year() + '/' + self.enemSubject() + '.json');
    });

    self.chartOptions = {
      dataSource: ko.computed(function() {
        if (self.schoolId() == undefined) return;   // Return immediatelly if no school selected.

        var schoolSeriesData, dataSource = [], cityTotal = 0.0, schoolTotal = 0.0;

        // Get the selected school data series.
        schoolSeriesData = syncGetJSON('/schools/' + self.schoolId() + '/aggregated_scores/' + self.year() + '/' + self.enemSubject() + '.json');
      
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
      }),
      
      series: ko.computed(function() {
        if (self.schoolName() == undefined) return;   // Return immediatelly if no school selected.

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

  window.viewModel = new ViewModel();
  ko.applyBindings(window.viewModel);
});
