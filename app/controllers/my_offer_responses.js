import { sort, alias } from "@ember/object/computed";
import applicationController from "./application";
import { inject as service } from "@ember/service";

export default applicationController.extend({
  offerResponses: alias("model"),
  messageBox: service(),
  i18n: service(),

  sortProperties: ["createdAt:desc"],
  arrangedOrders: sort("offerResponses", "sortProperties"),

  offers: Ember.computed("offerResponses.[]", function() {
    return this.get("offerResponses").map(response => response.get("offer"));
  }),

  actions: {
    visitSharedOffer(offer) {
      this.transitionToRoute("offers.messages", offer.id, {
        queryParams: {
          uid: offer.get("publicUid")
        }
      });
    }
  }
});
