import AuthorizeRoute from "../authorize";
import { inject as service } from "@ember/service";

export default AuthorizeRoute.extend({
  offerService: service(),
  beforeModel(transition) {
    this._super(...arguments);

    if (!this.get("session").accountDetailsComplete()) {
      transition.abort();
      this.controllerFor("login").set("attemptedTransition", transition);
      this.get("router").transitionTo("account_details");
    }
  },

  async model(params) {
    this.set("offerId", params.offer_id);
    this.set("offerResponseId", "");
    let offerShareable = await this.get("offerService")
      .getDetailOffer(params.uid)
      .catch(e => false);

    this.set("offerShareable", offerShareable);
    let offerResponse = await this.store.query("offerResponse", {
      offer_response: {
        user_id: this.get("session.currentUser").id,
        offer_id: params.offer_id
      }
    });

    if (offerResponse.content.length > 0) {
      this.set("offerResponseId", offerResponse.content[0].id);
      return this.store.query("message", {
        messageable_type: "OfferResponse",
        messageable_id: this.get("offerResponseId")
      });
    }
  },

  setupController(controller, model) {
    this._super(controller, model);
    let isChatVisible = false;
    if (this.get("offerShareable")) {
      let expiresAt = this.get("offerShareable").expires_at;
      isChatVisible = expiresAt ? moment(expiresAt) > moment() : true;
    }

    this.controllerFor("application").set("cart.checkout", false);
    controller.set("showOfferShareDetails", false);
    controller.set("isChatVisible", isChatVisible);
    controller.set("shareableoffer", this.get("offerShareable"));
    controller.set("offerResponseId", this.get("offerResponseId"));
    controller.set("model", { id: this.get("offerId") });
    controller.send("markRead");
  }
});
