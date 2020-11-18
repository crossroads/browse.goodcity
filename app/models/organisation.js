import { computed } from "@ember/object";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo, hasMany } from "ember-data/relationships";
import { alias } from "@ember/object/computed";

export default Model.extend({
  nameEn: attr("string"),
  nameZhTw: attr("string"),
  registration: attr("string"),
  website: attr("string"),
  descriptionEn: attr("string"),
  descriptionZhTw: attr("string"),
  position: attr("string"),
  user: belongsTo("user", { async: false }),

  usersCount: alias("organisationsUsers.length"),

  organisationsUsers: hasMany("organisations_user", { async: false }),

  nameAndDescription: computed("nameEn", "descriptionEn", function() {
    return this.get("nameEn") + " " + this.get("descriptionEn");
  })
});
