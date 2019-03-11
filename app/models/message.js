import Ember from "ember";
import DS from "ember-data";

var attr = DS.attr,
  belongsTo = DS.belongsTo;

export default DS.Model.extend({
  session: Ember.inject.service(),
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
  order: belongsTo("order", {
    async: false
  }),

  myMessage: Ember.computed(function() {
    return this.get("sender.id") === this.get("session.currentUser.id");
  }),

  isMessage: Ember.computed("this", function() {
    return true;
  }),

  createdDate: Ember.computed(function() {
    return new Date(this.get("createdAt")).toDateString();
  }),

  isRead: Ember.computed.equal("state", "read"),
  isUnread: Ember.computed.equal("state", "unread")
});
