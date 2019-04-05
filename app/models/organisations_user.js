import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  userId: attr("number"),
  organisationId: attr("number"),
  position: attr("string"),
  preferredContactNumber: attr("string"),
  user: belongsTo("user", {
    async: false
  }),
  organisation: belongsTo("organisation", {
    async: false
  }),

  hasPosition: Ember.computed("position", function() {
    return this.get("position") && this.get("position").length !== 0;
  }),

  hasPreferredContactNumber: Ember.computed(
    "preferredContactNumber",
    function() {
      return (
        this.get("preferredContactNumber") &&
        this.get("preferredContactNumber").length !== 0
      );
    }
  ),

  isInfoComplete: Ember.computed(
    "hasPosition",
    "hasPreferredContactNumber",
    function() {
      return this.get("hasPosition") && this.get("hasPreferredContactNumber");
    }
  )
});
