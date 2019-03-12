import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  name: attr("string"),
  mobile: attr("string"),
  address: belongsTo("address", { async: false })
});
