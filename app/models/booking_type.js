import { computed } from "@ember/object";
import Model from "ember-data/model";
import attr from "ember-data/attr";

export default Model.extend({
  nameEn: attr("string"),
  nameZh: attr("string"),
  identifier: attr("string"),

  isAppointment: computed("identifier", function() {
    return this.get("identifier") === "appointment";
  }),

  isOnlineOrder: computed("identifier", function() {
    return this.get("identifier") === "online-order";
  })
});
