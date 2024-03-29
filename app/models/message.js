import { equal } from "@ember/object/computed";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import DS from "ember-data";

var attr = DS.attr,
  belongsTo = DS.belongsTo;

export default DS.Model.extend({
  session: service(),
  body: attr("string"),
  senderId: attr("number"),
  isPrivate: attr("boolean"),
  createdAt: attr("date"),
  updatedAt: attr("date"),
  state: attr("string", {
    defaultValue: "read"
  }),
  sender: belongsTo("user", {
    async: false
  }),
  unreadCount: attr("string"),
  lookup: attr("string"),

  messageableType: attr("string"),
  messageableId: attr("string"),

  order: belongsTo("order", { async: false }),
  offerResponse: belongsTo("offer_response", { async: false }),

  shareablePublicId: attr("string"),

  parsedBody: Ember.computed("body", function() {
    let body = this.get("body");
    let lookup = this.get("lookup");
    if (!lookup) {
      return body;
    } else {
      lookup = JSON.parse(lookup);
      Object.keys(lookup).forEach(key => {
        body = body.replace(
          new RegExp(`\\[:${key}\\]`, "g"),
          `<span class='mentioned'>@${lookup[key].display_name}</span>`
        );
      });
      return body;
    }
  }),

  plainBody: Ember.computed("body", function() {
    let body = this.get("body");
    let lookup = this.get("lookup");

    if (Object.keys(lookup).length === 0) {
      return body;
    } else {
      lookup = JSON.parse(lookup);
      Object.keys(lookup).forEach(key => {
        body = body.replace(
          new RegExp(`\\[:${key}\\]`, "g"),
          lookup[key].display_name
        );
      });
    }
    return body;
  }),

  myMessage: computed("sender", function() {
    return this.get("sender.id") === this.get("session.currentUser.id");
  }),

  isMessage: computed("this", function() {
    return true;
  }),

  createdDate: computed("createdAt", function() {
    return new Date(this.get("createdAt")).toDateString();
  }),

  isOrderMessage: equal("messageableType", "Order"),
  isOfferResponseMessage: equal("messageableType", "OfferResponse"),
  isRead: equal("state", "read"),
  isUnread: equal("state", "unread")
});
