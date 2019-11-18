import { computed } from "@ember/object";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  quantity: attr("number"),
  state: attr("string"),
  package: belongsTo("package", { async: false }),
  order: belongsTo("order", { async: false }),
  orderId: attr("number"),
  packageId: attr("number"),
  createdAt: attr("date"),

  availableQty: computed("quantity", function() {
    return this.get("quantity");
  }),

  isSingleQuantity: computed("quantity", function() {
    return this.get("quantity") === 1;
  })
});
