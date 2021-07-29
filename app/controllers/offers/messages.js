import Controller from "@ember/controller";
import { sort } from "@ember/object/computed";
import { inject as service } from "@ember/service";

export default Controller.extend({
  queryParams: ["uid"],
  sortProperties: ["createdAt: asc"],
  sortedMessages: sort("messages", "sortProperties"),
  body: "",
  offerResponseId: "",
  shareableoffer: "",
  messagesUtil: service("messages"),

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

  isStaffMember: Ember.computed("session.currentUser.userRoles.[]", function() {
    return this.get("session.currentUser")
      ? !!this.get("session.currentUser").get("userRoles").length
      : false;
  }),

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
      return this.get("allMessages").filter(m => {
        return (
          m.get("messageableType") == "OfferResponse" &&
          m.get("messageableId") == this.get("offerResponseId")
        );
      });
    }
  ),

  actions: {
    async sendMessage() {
      $("textarea").trigger("blur");
      var values = this.getProperties("body");
      values.body = values.body.trim();
      values.body = Ember.Handlebars.Utils.escapeExpression(values.body || "");
      values.body = values.body.replace(/(\r\n|\n|\r)/gm, "<br>");
      values.isPrivate = false;
      values.createdAt = new Date();

      if (!this.get("offerResponseId")) {
        let offer = this.store.createRecord("offer", {
          id: this.get("model.id")
        });

        let record = this.store.createRecord("offerResponse", {
          userId: this.get("session.currentUser.id"),
          offer: offer
        });
        let offerResponse = await record.save();
        this.set("offerResponseId", offerResponse.id);
      }

      values.messageableType = "OfferResponse";
      values.messageableId = this.get("offerResponseId");
      values.sender = this.store.peekRecord(
        "user",
        this.get("session.currentUser.id")
      );
      this.createMessage(values);
    },

    markRead() {
      this.get("sortedMessages")
        .filterBy("state", "unread")
        .forEach(message => {
          this.get("messagesUtil").markRead(message);
        });
    }
  }
});
