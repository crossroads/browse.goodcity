import Ember from "ember";
import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  orderService: Ember.inject.service(),

  async beforeModel() {
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
    return this.get("orderService")
      .loadAll({ shallow: true })
      .then(orders => {
        return orders.filter(this.isPackageSubmittableOrder);
      });
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
  },

  isPackageSubmittableOrder(order) {
    const orderState = order.get("state");
    return ["submitted", "processing"].includes(orderState);
  }
});
