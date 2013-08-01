$(function() {
  function ViewModel() {
    self = this;
    
		self.year         = ko.observable(2011);
		self.enemSubject  = ko.observable('NAT');
		self.cityId       = ko.observable(3550308);
    self.cityName     = ko.observable('São Paulo');
    self.schoolId     = ko.observable();
    self.schoolName   = ko.observable();

    self.citySeriesData = ko.computed(function() {
      var series;
      
      $.ajax({
        type: 'GET',
        url: '/cities/' + self.cityId() +'/aggregated_scores/' + self.year() + '/' + self.enemSubject() + '.json',
        dataType: 'json',
        success: function(data) { series = data; },
        data: {},
        async: false
      });
      
      return series;
    });

    self.chartOptions = {
      dataSource: ko.computed(function() {
        if (self.schoolId() == undefined) return;   // Return immediatelly if no school selected.

        var schoolSeriesData, dataSource = [], cityTotal = 0.0, schoolTotal = 0.0;

        // Get the selected school data series.
        $.ajax({
          type: 'GET',
          url: '/schools/' + self.schoolId() +'/aggregated_scores/' + self.year() + '/' + self.enemSubject() + '.json',
          dataType: 'json',
          success: function(data) { schoolSeriesData = data; },
          data: {},
          async: false
        });
      
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
            average: cityTotal  > 0 ? (self.citySeriesData()[i] / cityTotal   || 0) * 100.0 : 0.0
          }
        }

        return dataSource;
      }),
      
      series: ko.computed(function() {
        if (self.schoolName() == undefined) return;   // Return immediatelly if no school selected.

        return [
          { valueField: 'school', name: self.schoolName() },
          { valueField: 'average', name: 'Média da cidade de ' + self.cityName() }
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
