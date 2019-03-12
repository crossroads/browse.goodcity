import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";
import Ember from "ember";

export default Model.extend({
  flat: attr("string"),
  building: attr("string"),
  street: attr("string"),
  addressType: attr("string"),

  district: belongsTo("district", { async: false }),

  addressableType: attr("string"),
  addressable: belongsTo("addressable", { polymorphic: true, async: false }),

  fullAddress: Ember.computed("flat", "building", "street", function() {
    return `${this.get("flat")} ${this.get("building")} ${this.get("street")}`;
  })
});
