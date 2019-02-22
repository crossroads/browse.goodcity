import Ember from "ember";

export default Ember.Helper.helper(function (value) {
  var todayText = value[1];
  var dateValue = value[0];
  var _MS_PER_DAY = 1000 * 60 * 60 * 24;
  var message_date = Date.parse(dateValue);
  var current_time = Date.now();

  var day_difference = (current_time - message_date) / _MS_PER_DAY;

  if (!message_date) {
    return "";
  } else if (day_difference < 1) {
    return todayText;
  } else if (day_difference < 7) {
    return moment(message_date).format('dddd');
  } else {
    return moment(message_date).format('DD MMM, YYYY');
  }
});
