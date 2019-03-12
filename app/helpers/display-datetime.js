import Ember from "ember";

// Date Format used in App:
// "12 Feb '16" => "DD MMM 'YY"

export default Ember.Helper.helper(function(value, params) {
  var parseDate = Date.parse(value);

  if (parseDate) {
    return moment(parseDate).format(params.format);
  } else {
    return "";
  }
});
