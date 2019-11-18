import { inject as service } from "@ember/service";
import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  orderService: service(),

  async beforeModel() {
    if (!this._super(...arguments)) {
      return; // not logged in
    }

    const hasSubmittedOrders = await this.get(
      "orderService"
    ).hasSubmittedOrders();

    if (!hasSubmittedOrders) {
      let lastDraftOrder = await this.get("orderService").getLastDraft({
        appointment: false
      });
      const orderId = lastDraftOrder ? lastDraftOrder.get("id") : null;
      this.transitionTo("request_purpose", {
        queryParams: {
          onlineOrder: true,
          bookAppointment: false,
          orderId: orderId
        }
      });
    }
  },

  model() {
    return this.get("orderService").fetchOrdersOfType({ appointment: false });
  },

  setupController(controller, model) {
    this._super(controller, model);
    this.controllerFor("application").set("showSidebar", false);
  },

  resetController: function(isExiting) {
    this._super.apply(this, arguments);
    if (isExiting) {
      this.controllerFor("application").set("showSidebar", true);
    }
  }
});
