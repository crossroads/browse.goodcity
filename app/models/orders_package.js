import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";
import Ember from "ember";

export default Model.extend({
  quantity: attr("number"),
  state: attr("string"),
  package: belongsTo("package", { async: false }),
  order: belongsTo("order", { async: false }),
  orderId: attr("number"),
  packageId: attr("number"),
  createdAt: attr("date"),

  availableQty: Ember.computed("quantity", function() {
    return this.get("quantity");
  }),

  isSingleQuantity: Ember.computed("quantity", function() {
    return this.get("quantity") === 1;
  })
});
