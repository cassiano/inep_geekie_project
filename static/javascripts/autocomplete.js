$(function() {
  var cache = { cities: {}, schools: {} };
  
  $('#city').autocomplete({
    minLength: 3,
    source: function(request, response) {
      var term = request.term;
      var state = viewModel.state();

      if (term in (cache.cities[state] || {})) {
        response(cache.cities[state][term]);
        return;
      }

      $.getJSON('/states/' + state + '/cities/search.json', request, function(data, status, xhr) {
        cache.cities[state]       = cache.cities[state] || {};
        cache.cities[state][term] = data.cities;

        response(cache.cities[state][term]);
      });
    },
    select: function(event, ui) {
      // Update the view model with the selected city id and name.
      viewModel.cityId(ui.item.id);
      viewModel.cityName(ui.item.value);
      
      $('#school').val('');           // Reset the school (autocomplete) input text.
      viewModel.schoolId(null);
      viewModel.schoolName(null);
    }
  });

  $('#school').autocomplete({
    minLength: 3,
    source: function(request, response) {
      var term   = request.term;
      var cityId = viewModel.cityId();

      if (term in (cache.schools[cityId] || {})) {
        response(cache.schools[cityId][term]);
        return;
      }

      $.getJSON('/schools/search/' + cityId + '.json', request, function(data, status, xhr) {
        cache.schools[cityId]       = cache.schools[cityId] || {};
        cache.schools[cityId][term] = data.schools;

        response(cache.schools[cityId][term]);
      });
    },
    select: function(event, ui) {
      // Update the view model with the selected school id and name.
      viewModel.schoolId(ui.item.id);
      viewModel.schoolName(ui.item.value);
    }
  });
});
