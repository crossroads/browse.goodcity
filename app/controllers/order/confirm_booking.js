import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import EmberObject from "@ember/object";
import Controller from "@ember/controller";
import _ from "lodash";
import cancelOrderMixin from "../../mixins/cancel_order";
import asyncTasksMixin from "../../mixins/async_tasks";

export default Controller.extend(cancelOrderMixin, asyncTasksMixin, {
  showCancelBookingPopUp: false,
  messageBox: service(),
  orderService: service(),
  cart: service(),
  order: alias("model"),
  updatedValue: EmberObject.create({}),

  submitOrder(order) {
    return this.runTask(
      order.get("isOnlineOrder")
        ? this.get("cart").checkoutOrder(order)
        : this.get("orderService").submitOrder(order)
    );
  },

  updateRequestedQuantityValue(record) {
    return Object.keys(record).map(pkgId => {
      this.get("cart").updateRequestedQuantity(pkgId, record[pkgId]);
    });
  },

  badCart() {
    let order = this.get("order");
    return order.get("isOnlineOrder") && !this.get("cart.canCheckout");
  },

  emptyCart() {
    let order = this.get("order");
    return order.get("isOnlineOrder") && this.get("cart.isEmpty");
  },

  actions: {
    setUpdatedValue(value, id) {
      this.get("updatedValue").set(id, value);
    },

    browseMore() {
      this.transitionToRoute("browse");
    },

    async confirmBooking() {
      let order = this.get("order");

      if (this.emptyCart()) {
        return this.i18nAlert("cart_content.empty_cart", _.noop);
      }

      if (this.badCart()) {
        return this.i18nAlert("items_not_available", _.noop);
      }

      await this.updateRequestedQuantityValue(this.get("updatedValue"));

      this.submitOrder(order).then(() => {
        this.transitionToRoute("order.booking_success", this.get("order.id"));
      });
    }
  }
});
