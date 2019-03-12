import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  orderId: attr("number"),
  purposeId: attr("number"),
  order: belongsTo("order", { async: false }),
  purpose: belongsTo("purpose", { async: false })
});
