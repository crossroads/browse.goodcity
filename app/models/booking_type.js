import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";

export default Model.extend({
  nameEn: attr("string"),
  nameZh: attr("string"),

  isAppointment: Ember.computed("nameEn", function() {
    const name = this.get('nameEn') && this.get('nameEn').toLowerCase();
    return name === "appointment";
  })
});
