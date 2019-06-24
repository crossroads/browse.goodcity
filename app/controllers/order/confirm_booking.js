import Ember from "ember";
import cancelOrderMixin from "../../mixins/cancel_order";
import asyncTasksMixin from "../../mixins/async_tasks";

export default Ember.Controller.extend(cancelOrderMixin, asyncTasksMixin, {
  showCancelBookingPopUp: false,
  messageBox: Ember.inject.service(),
  orderService: Ember.inject.service(),
  cart: Ember.inject.service(),
  order: Ember.computed.alias("model"),

  submitOrder(order) {
    return this.runTask(
      order.get("isOnlineOrder")
        ? this.get("cart").checkoutOrder(order)
        : this.get("orderService").submitOrder(order)
    );
  },

  badCart() {
    let order = this.get("order");
    return order.get("isOnlineOrder") && !this.get("cart.canCheckout");
  },

  actions: {
    confirmBooking() {
      let order = this.get("order");

      if (this.badCart()) {
        return this.i18nAlert("items_not_available", () => {
          this.transitionToRoute("cart");
        });
      }

      this.submitOrder(order).then(() => {
        this.transitionToRoute("order.booking_success", this.get("order.id"));
      });
    }
  }
});
