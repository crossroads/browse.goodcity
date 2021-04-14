import { helper as buildHelper } from "@ember/component/helper";

export default buildHelper(function(value) {
  var _MS_PER_DAY = 86400000;
  var messageTime = Date.parse(value);
  var currentTime = Date.now();

  var dayDifference = Math.floor((currentTime - messageTime) / _MS_PER_DAY);

  if (!messageTime) {
    return "";
  } else if (dayDifference < 1) {
    return moment(messageTime).format("HH:mm");
  } else if (dayDifference < 7) {
    return moment(messageTime).format("dddd");
  } else {
    return moment(messageTime).format("DD.MM");
  }
});
