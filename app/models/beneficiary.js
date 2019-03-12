import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";
import Ember from "ember";

export default Model.extend({
  firstName: attr("string"),
  lastName: attr("string"),
  identityNumber: attr("string"),
  title: attr("string"),
  phoneNumber: attr("string"),
  identityTypeId: attr("number"),
  identityType: belongsTo("identityType", { async: false }),

  fullName: Ember.computed("firstName", "lastName", function() {
    return (
      this.get("title") +
      " " +
      this.get("firstName") +
      " " +
      this.get("lastName")
    );
  })
});
