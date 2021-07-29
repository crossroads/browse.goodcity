import PublicRoute from "../browse_pages";
import { inject as service } from "@ember/service";
import _ from "lodash";

export default PublicRoute.extend({
  offerService: service(),

  async model({ offer_id }) {
    this.set("offerResponsePresent", false);
    let offerShareable = await this.get("offerService").getDetailOffer(
      offer_id
    );
    this.set("offerShareable", offerShareable);
    let offerResponse = await this.store.query("offerResponse", {
      offer_response: {
        user_id: this.get("session.currentUser").id,
        offer_id: offerShareable.id
      }
    });
    if (offerResponse.content.length > 0) {
      this.set("offerResponsePresent", true);
    }
    return offerShareable;
  },

  setupController(controller, model) {
    let offerNotPresent = false;
    let expiresAt = model.expires_at;
    if (!this.session.get("isLoggedIn")) {
      offerNotPresent = true;
    }
    if (!this.get("offerNotPresent") && expiresAt) {
      offerNotPresent = moment(expiresAt) < moment();
    }
    controller.set("model", model);
    controller.set("offerNotPresent", offerNotPresent);
  }
});
