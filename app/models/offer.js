import { computed } from "@ember/object";
import { equal, not } from "@ember/object/computed";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo, hasMany } from "ember-data/relationships";

export default Model.extend({
  state: attr("string"),
  packages: hasMany("package", {
    async: false
  })
});
