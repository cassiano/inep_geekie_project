$(function() {
  var cache = { cities: {}, schools: {} };
  
  $('#city').autocomplete({
    minLength: 3,
    source: function(request, response) {
      var term = request.term;
      var state = window.viewModel.state();

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
      window.viewModel.cityId(ui.item.id);
      window.viewModel.cityName(ui.item.value);
      
      $('#school-container').show();  // Show the school container (label + autocomplete), since it will be hidden when the page first loads.
      $('#school').val('');           // Reset the school (autocomplete) input text.
      $('#chartContainer').hide();    // Hide the chart.
    }
  });

  $('#school').autocomplete({
    minLength: 3,
    source: function(request, response) {
      var term   = request.term;
      var cityId = window.viewModel.cityId();

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
      window.viewModel.schoolId(ui.item.id);
      window.viewModel.schoolName(ui.item.value);
    }
  });
});
