import { computed } from "@ember/object";
import Model from "ember-data/model";
import attr from "ember-data/attr";

export default Model.extend({
  name: attr("string"),
  disabled: attr("boolean"),

  specialId: computed("id", function() {
    return this.get("id") + "_ggv";
  })
});
