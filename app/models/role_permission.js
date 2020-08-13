import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  permissionId: attr("number"),
  roleId: attr("number"),

  permission: belongsTo("permission", { async: false }),
  role: belongsTo("role", { async: false })
});
