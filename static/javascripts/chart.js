$(function() {
  window.viewModel = {
    chartOptions: {
      dataSource: ko.observableArray(),
      commonSeriesSettings: {
        argumentField: 'scoreRange',
        type: 'bar',
        label:{
          visible: false,
          format: "fixedPoint",
          precision: 1
        }
      },
      series: ko.observableArray(),
      title: {
        text: 'Histograma de comparação'
      },    
      legend: {
        verticalAlignment: 'bottom',
        horizontalAlignment: 'center'
      }      
    }
  };

  ko.applyBindings(window.viewModel);

  var enemSubject = $('#enem_subject').val();
  var year        = $('#year').val();
  var cityId      = $('#city_id').val();
  var api         = '/cities/' + cityId +'/aggregated_scores/' + year + '/' + enemSubject + '.json';

  window.city = {};
  window.city.details = { name: 'São Paulo' };    // TODO: implement an API for getting city details.
  
  // Get the city data series and save it in the DOM.
  $.getJSON(api, function(data) {
    window.city.data_series = data;
  });
});

window.updateChartData = function(schoolData) {
  var dataSource = [], cityTotal = 0, schoolTotal = 0;

  // Show the chart, since it will be hidden when the page first loads.
  $('#chartContainer').show();

  // Calculate totals.
  $.each(schoolData,              function(index, value) { schoolTotal  += value })
  $.each(window.city.data_series, function(index, value) { cityTotal    += value })

  // Format the data source.
  for (var i = 0; i < 10; i++) {
    dataSource[i] = {
      scoreRange: i + '-' + (i + 1), 
      school: schoolTotal > 0 ? (schoolData[i] / schoolTotal || 0) * 100.0 : 0.0,
      average: cityTotal > 0 ? (window.city.data_series[i] / cityTotal || 0) * 100.0 : 0.0
    }
  }

  window.viewModel.chartOptions.series([
    { valueField: 'school', name: $('#school_name').val() },
    { valueField: 'average', name: 'Média da cidade de ' + window.city.details['name'] }
  ]);
 
  window.viewModel.chartOptions.dataSource(dataSource);
}
