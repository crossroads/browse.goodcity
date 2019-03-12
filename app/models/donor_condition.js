import Model from "ember-data/model";
import attr from "ember-data/attr";
import { hasMany } from "ember-data/relationships";
import Ember from "ember";

export default Model.extend({
  name: attr("string"),
  items: hasMany("item", { async: false }),

  conditionName: Ember.computed("name", function() {
    return this.get("name");
  })
});
