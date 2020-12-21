import { hash } from "rsvp";
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
    controller.set("messages", model);
    controller.set("model", { id: this.get("offerId") });
  }
});
