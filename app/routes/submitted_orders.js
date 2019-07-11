import Ember from "ember";
import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  orderService: Ember.inject.service(),

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

  deactivate() {
    this.controllerFor("application").set("showSidebar", true);
  },

  isPackageSubmittableOrder(order) {
    const orderState = order.get("state");
    return ["draft", "submitted", "processing"].includes(orderState);
  }
});
