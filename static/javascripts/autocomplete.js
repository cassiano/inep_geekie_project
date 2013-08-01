$(function() {
  var cache = {};
  
  $('#school').autocomplete({
    minLength: 3,
    source: function(request, response) {
      var term = request.term;
      if (term in cache) {
        response(cache[term]);
        return;
      }

      $.getJSON('/schools/search/' + $('#city_id').val() + '.json', request, function(data, status, xhr) {
        cache[term] = data.schools;
        response(cache[term]);
      });
    },
    select: function(event, ui) {
      var schoolId = ui.item.id;

      // Save the selected school id and name in the DOM.
      $('#school_id').val(schoolId);
      $('#school_name').val(ui.item.value);

      // Get the selected school data series.
      var enemSubject = $('#enem_subject').val();
      var year         = $('#year').val();
      var api          = '/schools/' + schoolId +'/aggregated_scores/' + year + '/' + enemSubject + '.json';

      $.getJSON(api, function(data) {
        window.updateChartData(data);
      });
    }
  })
});
