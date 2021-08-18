import PublicRoute from "../browse_pages";
import { inject as service } from "@ember/service";
import _ from "lodash";

export default PublicRoute.extend({
  offerService: service(),
  session: service(),

  async model({ offer_id }) {
    this.set("offerResponsePresent", false);
    this.set("offerNotPresent", false);
    let offerShareable = await this.get("offerService")
      .getDetailOffer(offer_id)
      .catch(e => false);

    if (offerShareable && this.session.get("isLoggedIn")) {
      let offerResponse = await this.store.query("offerResponse", {
        offer_response: {
          user_id: this.get("session.currentUser").id,
          offer_id: offerShareable.id
        }
      });
      this.set("offerResponsePresent", Boolean(offerResponse.content.length));
    }
    return offerShareable ? offerShareable : this.set("offerNotPresent", true);
  },

  setupController(controller, model) {
    let expiresAt = model && model.expires_at;
    if (expiresAt && moment(expiresAt) < moment()) {
      this.set("offerNotPresent", !this.get("offerResponsePresent"));
    }
    controller.set("model", model);
    controller.set("offerNotPresent", this.get("offerNotPresent"));
  }
});
