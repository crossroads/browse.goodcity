import Ember from "ember";

// Timestamp we get from api:
// "2018-12-03T03:30:00.000+08:00"

export default Ember.Helper.helper(function([timestamp, format]) {
  return moment.tz(timestamp, "Asia/Hong_Kong").format(format);
});
