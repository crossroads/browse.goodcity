import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  userId: attr("string"),
  user: belongsTo("user", { async: false }),
  packageId: attr("string"),
  package: belongsTo("package", { async: false }),
  isAvailable: attr("boolean")
});
