import { computed } from "@ember/object";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { hasMany } from "ember-data/relationships";

export default Model.extend({
  name: attr("string"),
  rolePermissions: hasMany("rolePermission", { async: false }),

  permissions: computed("rolePermissions.[]", function() {
    return this.get("rolePermissions").getEach("permission");
  }),

  permissionNames: computed("permissions.[]", function() {
    return this.get("permissions").getEach("name");
  })
});
