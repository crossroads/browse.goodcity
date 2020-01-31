import { computed } from "@ember/object";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  nameEn: attr("string"),
  nameZhTw: attr("string"),
  registration: attr("string"),
  website: attr("string"),
  descriptionEn: attr("string"),
  descriptionZhTw: attr("string"),
  position: attr("string"),
  user: belongsTo("user", { async: false }),

  nameAndDescription: computed("nameEn", "descriptionEn", function() {
    return this.get("nameEn") + " " + this.get("descriptionEn");
  })
});
