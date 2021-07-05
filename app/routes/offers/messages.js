import AuthorizeRoute from "../authorize";

export default AuthorizeRoute.extend({
  async model({ offer_id }) {
    this.set("offerId", offer_id);
    this.set("offerResponseId", "");
    let offerResponse = await this.store.query("offerResponse", {
      offer_response: {
        user_id: this.get("session.currentUser").id,
        offer_id: offer_id
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
    this.controllerFor("application").set("cart.checkout", false);
    controller.set("offerResponseId", this.get("offerResponseId"));
    controller.set("model", { id: this.get("offerId") });
    controller.send("markRead");
  }
});
