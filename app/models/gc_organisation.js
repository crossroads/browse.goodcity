import { alias } from "@ember/object/computed";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { hasMany } from "ember-data/relationships";

export default Model.extend({
  nameEn: attr("string"),
  nameZhTw: attr("string"),
  usersCount: alias("organisationsUsers.length"),

  organisationsUsers: hasMany("organisations_user", { async: false })
});
