import { computed } from "@ember/object";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  userId: attr("number"),
  organisationId: attr("number"),
  position: attr("string"),
  status: attr("string"),
  preferredContactNumber: attr("string"),
  user: belongsTo("user", {
    async: false
  }),
  organisation: belongsTo("organisation", {
    async: false
  }),

  hasPosition: computed("position", function() {
    var position = this.get("position");
    return position && position.length;
  }),

  hasPreferredContactNumber: computed("preferredContactNumber", function() {
    var preferredContactNumber = this.get("preferredContactNumber");
    return preferredContactNumber && preferredContactNumber.length;
  }),

  isInactive: computed.not("isActive"),

  isActive: computed("status", function() {
    return (
      this.get("status") === "pending" || this.get("status") === "approved"
    );
  }),

  isInfoComplete: computed(
    "hasPosition",
    "hasPreferredContactNumber",
    function() {
      return this.get("hasPosition") && this.get("hasPreferredContactNumber");
    }
  )
});
