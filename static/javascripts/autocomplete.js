function clearAutocompleteAndViewModelSchoolData() {
  $('#school').val('');

  viewModel.schoolId(null);
  viewModel.schoolName(null);
}

function updateViewModelCityData(id, name) {
  viewModel.cityId(id);
  viewModel.cityName(name);
}

function updateViewModelSchoolData(id, name) {
  viewModel.schoolId(id);
  viewModel.schoolName(name);
}

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
      // Update the view model's school (id and name).
      updateViewModelSchoolData(ui.item.id, ui.item.value);
    }
  });
});
