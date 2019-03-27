import config from "../../config/environment";
import detail from "./detail";
import Ember from "ember";

export default detail.extend({
  messagesUtil: Ember.inject.service("messages"),
  isPrivate: false,
  order: Ember.computed.alias("model"),
  isMobileApp: config.cordova.enabled,
  i18n: Ember.inject.service(),
  sortProperties: ["createdAt: asc"],

  noMessage: Ember.computed.empty("model.messages"),

  displayChatNote: Ember.computed("noMessage", "disabled", function() {
    return this.get("noMessage") && !this.get("disabled");
  }),

  sortedMessages: Ember.computed.sort("model.messages", "sortProperties"),

  groupedMessages: Ember.computed("sortedMessages", function() {
    this.autoScroll();
    return this.groupBy(this.get("sortedMessages"), "createdDate");
  }),

  autoScroll() {
    window.scrollTo(0, document.body.scrollHeight);
  },

  groupBy: function(content, key) {
    var result = [];
    var object, value;

    content.forEach(function(item) {
      value = item.get(key);
      object = result.findBy("value", value);
      if (!object) {
        object = {
          value: value,
          items: []
        };
        result.push(object);
      }
      return object.items.push(item);
    });
    return result.getEach("items");
  },

  createMessage(values) {
    var message = this.store.createRecord("message", values);
    message
      .save()
      .then(() => {
        this.set("body", "");
      })
      .catch(error => {
        this.store.unloadRecord(message);
        throw error;
      });
  },

  actions: {
    sendMessage() {
      Ember.$("textarea").trigger("blur");
      var values = this.getProperties("body");
      values.order = this.get("model");
      values.isPrivate = false;
      values.createdAt = new Date();
      values.sender = this.store.peekRecord(
        "user",
        this.get("session.currentUser.id")
      );
      this.createMessage(values);

      // Animate and scroll to bottom
      this.autoScroll();
    },
    markRead() {
      this.get("sortedMessages")
        .filterBy("state", "unread")
        .forEach(message => this.get("messagesUtil").markRead(message));
    }
  }
});
