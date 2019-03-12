import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";

export default Model.extend({
  nameEn: attr("string"),
  nameZh: attr("string"),
  identifier: attr("string"),

  isAppointment: Ember.computed("identifier", function() {
    return this.get("identifier") === "appointment";
  }),

  isOnlineOrder: Ember.computed("identifier", function() {
    return this.get("identifier") === "online-order";
  })
});
