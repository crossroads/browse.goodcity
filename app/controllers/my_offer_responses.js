import { sort, alias } from "@ember/object/computed";
import applicationController from "./application_root";
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
      if (offer.get("openForResponses")) {
        this.transitionToRoute("offers.detail", offer.get("publicUid"));
      } else {
        this.get("messageBox").alert(
          this.get("i18n").t("my_dashboard.from_donors.closed_offer")
        );
      }
    }
  }
});
