import { computed } from "@ember/object";
import { equal, not } from "@ember/object/computed";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo, hasMany } from "ember-data/relationships";

export default Model.extend({
  userId: attr("string"),
  offerId: attr("string"),

  messages: hasMany("message", {
    async: false
  }),

  offer: belongsTo("offer", { async: false })
});
