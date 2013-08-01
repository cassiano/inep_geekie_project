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

      $.getJSON('/schools/search/' + window.viewModel.cityId() + '.json', request, function(data, status, xhr) {
        cache[term] = data.schools;
        response(cache[term]);
      });
    },
    select: function(event, ui) {
      // Update the view model with the selected school id and name.
      window.viewModel.schoolId(ui.item.id);
      window.viewModel.schoolName(ui.item.value);
    }
  })
});
