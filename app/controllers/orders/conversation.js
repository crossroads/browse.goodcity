import { later } from "@ember/runloop";
import $ from "jquery";
import { computed } from "@ember/object";
import { alias, empty, sort } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import config from "../../config/environment";
import detail from "./detail";

export default detail.extend({
  subscription: service(),
  messagesUtil: service("messages"),
  isPrivate: false,
  order: alias("model"),
  isMobileApp: config.cordova.enabled,
  i18n: service(),
  sortProperties: ["createdAt: asc"],

  noMessage: empty("model.messages"),

  displayChatNote: computed("noMessage", "disabled", function() {
    return this.get("noMessage") && !this.get("disabled");
  }),

  sortedMessages: sort("model.messages", "sortProperties"),

  groupedMessages: computed("sortedMessages", function() {
    this.autoScroll();
    return this.groupBy(this.get("sortedMessages"), "createdDate");
  }),

  on() {
    this.get("subscription").on("change:message", this, this.markReadAndScroll);
  },

  off() {
    this.get("subscription").off(
      "change:message",
      this,
      this.markReadAndScroll
    );
  },

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

  markReadAndScroll: function({ record }) {
    let message = this.store.peekRecord("message", record.id);
    if (
      !message ||
      message.get("isRead") ||
      message.get("designationId") != this.get("model.id")
    ) {
      return;
    }

    this.get("messagesUtil").markRead(message);

    if (!$(".message-textbar").length) {
      return;
    }

    let scrollOffset = $(document).height();
    let screenHeight = document.documentElement.clientHeight;
    let pageHeight = document.documentElement.scrollHeight;

    if (pageHeight > screenHeight) {
      later(this, function() {
        window.scrollTo(0, scrollOffset);
      });
    }
  },

  actions: {
    sendMessage() {
      $("textarea").trigger("blur");
      var values = this.getProperties("body");
      values.body = values.body.trim();
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
