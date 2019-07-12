import Ember from "ember";
import asyncTasksMixin from "../mixins/async_tasks";
import { task } from "ember-concurrency";
import _ from "lodash";

export default Ember.Controller.extend(asyncTasksMixin, {
  cart: Ember.inject.service(),
  orderService: Ember.inject.service(),
  orderId: "",

  badCart() {
    return !this.get("cart.canCheckout");
  },

  emptyCart() {
    return this.get("cart.isEmpty");
  },

  checkoutCart: task(function*() {
    const orderId = this.get("orderId");
    const order = yield this.store.peekRecord("order", orderId);
    if (this.emptyCart()) {
      return this.i18nAlert("cart_content.empty_cart", _.noop);
    }
    if (this.badCart()) {
      return this.i18nAlert("items_not_available", _.noop);
    }
    try {
      yield this.runTask(this.get("cart").checkoutOrder(order));
    } catch (error) {
      throw error;
    }
    this.transitionToRoute("orders.goods", orderId);
  }),

  actions: {
    mergePackage() {
      if (this.get("orderId")) {
        this.get("checkoutCart").perform();
      } else {
        this.transitionToRoute("request_purpose", {
          queryParams: {
            onlineOrder: true,
            bookAppointment: false,
            orderId: null
          }
        });
      }
    }
  }
});
