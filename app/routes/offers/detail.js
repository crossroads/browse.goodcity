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
      this.get("offerResponsePresent")
        ? this.transitionTo("offers.messages", model.id, {
            queryParams: {
              uid: model.public_uid
            }
          })
        : this.set("offerNotPresent", true);
    }
    controller.set("model", model);
    controller.set("offerNotPresent", this.get("offerNotPresent"));
    this.controllerFor("application").set("hideHeaderBar", false);

    this.controllerFor("application").set(
      "pageTitle",
      `${this.get("i18n").t("shareableOffers.respond_to_offer")} ${
        model.id ? model.id : ""
      }`
    );
  },

  resetController: function(controller, isExiting) {
    this._super.apply(this, arguments);
    if (isExiting) {
      this.controllerFor("application").set(
        "pageTitle",
        this.get("i18n").t("browse.title")
      );
    }
  }
});
