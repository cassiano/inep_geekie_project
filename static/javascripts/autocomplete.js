$(function() {
  var cache = { cities: {}, schools: {} };
  
  $('#city').autocomplete({
    minLength: 3,
    source: function(request, response) {
      var term = request.term;

      if (term in cache.cities) {
        response(cache.cities[term]);
        return;
      }

      $.getJSON('/states/' + window.viewModel.state() + '/cities/search.json', request, function(data, status, xhr) {
        cache.cities[term] = data.cities;
        response(cache.cities[term]);
      });
    },
    select: function(event, ui) {
      // Update the view model with the selected city id and name.
      window.viewModel.cityId(ui.item.id);
      window.viewModel.cityName(ui.item.value);
      
      $('#school-container').show();  // Show the school container (label + autocomplete).
      $('#school').val('');           // Reset the school (autocomplete) input text.
      $('#chartContainer').hide();    // Hide the chart.
    }
  });

  $('#school').autocomplete({
    minLength: 3,
    source: function(request, response) {
      var term = request.term;

      if (term in cache.schools) {
        response(cache.schools[term]);
        return;
      }

      $.getJSON('/schools/search/' + window.viewModel.cityId() + '.json', request, function(data, status, xhr) {
        cache.schools[term] = data.schools;
        response(cache.schools[term]);
      });
    },
    select: function(event, ui) {
      // Update the view model with the selected school id and name.
      window.viewModel.schoolId(ui.item.id);
      window.viewModel.schoolName(ui.item.value);
    }
  });
});
