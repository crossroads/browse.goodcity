import { computed } from "@ember/object";
import { equal, not } from "@ember/object/computed";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo, hasMany } from "ember-data/relationships";

export default Model.extend({
  state: attr("string"),
  sharingExpiresAt: attr("date"),
  publicUid: attr("string"),

  packages: hasMany("package", { async: false }),
  offerResponse: belongsTo("offer_response", { async: false }),

  openForResponses: Ember.computed("sharingExpiresAt", function() {
    let expiresAt = this.get("sharingExpiresAt");
    if (expiresAt) {
      return expiresAt > moment();
    } else {
      return true;
    }
  }),

  // unread order messages
  unreadMessagesCount: computed(
    "offerResponse.messages.@each.state",
    function() {
      return this.get("offerResponse.messages").filterBy("state", "unread")
        .length;
    }
  ),

  hasUnreadMessages: computed("unreadMessagesCount", function() {
    return this.get("unreadMessagesCount") > 0;
  })
});
