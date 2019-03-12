import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  userId: attr("number"),
  roleId: attr("number"),

  user: belongsTo("user", { async: false }),
  role: belongsTo("role", { async: false })
});
