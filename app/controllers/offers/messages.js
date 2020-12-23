import Controller from "@ember/controller";
import { sort } from "@ember/object/computed";

export default Controller.extend({
  queryParams: ["uid"],
  sortProperties: ["createdAt: asc"],
  sortedMessages: sort("messages", "sortProperties"),
  body: "",

  createMessage(values) {
    if (values.body) {
      var message = this.store.createRecord("message", values);
      message
        .save()
        .then(() => {
          this.set("body", "");
          this.autoScroll();
        })
        .catch(error => {
          this.store.unloadRecord(message);
          throw error;
        });
    }
  },

  autoScroll() {
    window.scrollTo(0, document.body.scrollHeight);
  },

  allMessages: Ember.computed(function() {
    return this.get("store").peekAll("message");
  }),

  messages: Ember.computed(
    "model.id",
    "allMessages",
    "allMessages.[]",
    function() {
      return this.get("allMessages")
        .filterBy("messageableType", "Offer")
        .filterBy("messageableId", this.get("model.id"));
    }
  ),

  actions: {
    sendMessage() {
      $("textarea").trigger("blur");
      var values = this.getProperties("body");
      values.body = values.body.trim();
      // values.order = this.get("model");
      values.body = values.body.trim();

      values.body = Ember.Handlebars.Utils.escapeExpression(values.body || "");
      values.body = values.body.replace(/(\r\n|\n|\r)/gm, "<br>");
      values.isPrivate = false;
      values.createdAt = new Date();
      values.messageableType = "Offer";
      values.messageableId = this.get("model.id");
      values.sender = this.store.peekRecord(
        "user",
        this.get("session.currentUser.id")
      );
      console.log(this.get("uid"));

      this.createMessage(values);
    }
  }
});
