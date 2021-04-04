import { helper as buildHelper } from "@ember/component/helper";

export default buildHelper(function(value) {
  var _MS_PER_DAY = 86400000;
  var message_time = Date.parse(value);
  var current_time = Date.now();

  var day_difference = Math.floor((current_time - message_time) / _MS_PER_DAY);

  if (!message_time) {
    return "";
  } else if (day_difference < 1) {
    return moment(message_time).format("HH:mm");
  } else if (day_difference < 7) {
    return moment(message_time).format("dddd");
  } else {
    return moment(message_time).format("DD.MM");
  }
});
