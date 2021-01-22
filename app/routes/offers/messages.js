import AuthorizeRoute from "../authorize";

export default AuthorizeRoute.extend({
  model({ offer_id }) {
    this.set("offerId", offer_id);
    return this.store.query("message", {
      is_private: false,
      recipient_id: this.get("session.currentUser").id,
      messageable_type: "Offer",
      messageable_id: offer_id
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    if (this.get("session.currentUser").roleNames().length) {
      controller.set("isStaffMember", true);
    }
    this.controllerFor("application").set("cart.checkout", false);
    controller.set("model", { id: this.get("offerId") });
  }
});
