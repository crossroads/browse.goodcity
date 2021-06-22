import AuthorizeRoute from "../authorize";

export default AuthorizeRoute.extend({
  beforeModel(transition) {
    this._super(...arguments);

    if (!this.get("session").accountDetailsComplete()) {
      transition.abort();
      this.controllerFor("login").set("attemptedTransition", transition);
      this.get("router").transitionTo("account_details");
    }
  },

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
    this.controllerFor("application").set("cart.checkout", false);
    controller.set("model", { id: this.get("offerId") });
    controller.send("markRead");
  }
});
