import { computed } from "@ember/object";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { hasMany } from "ember-data/relationships";

export default Model.extend({
  name: attr("string"),
  items: hasMany("item", { async: false }),

  conditionName: computed("name", function() {
    return this.get("name");
  })
});
