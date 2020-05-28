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
  messageableType: attr("string"),
  messageableId: attr("string"),
  order: belongsTo("order", {
    async: false
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

  isRead: equal("state", "read"),
  isUnread: equal("state", "unread")
});
