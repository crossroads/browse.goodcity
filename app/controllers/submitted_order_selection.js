import Ember from "ember";
import asyncTasksMixin from "../mixins/async_tasks";
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

  submittableOrders: Ember.computed("model.@each.state", function() {
    return this.get("model").filter(this.isPackageSubmittableOrder);
  }),

  redirectToRequestPurpose() {
    this.transitionToRoute("request_purpose", {
      queryParams: {
        onlineOrder: true,
        bookAppointment: false,
        orderId: null
      }
    });
  },

  isPackageSubmittableOrder(order) {
    const orderState = order.get("state");
    return ["submitted", "processing"].includes(orderState);
  },

  async checkoutCart() {
    const orderId = this.get("orderId");
    const order = this.store.peekRecord("order", orderId);
    if (this.emptyCart()) {
      return this.i18nAlert("cart_content.empty_cart", _.noop);
    }
    if (this.badCart()) {
      return this.i18nAlert("items_not_available", _.noop);
    }
    await this.runTask(this.get("cart").checkoutOrder(order));
    this.transitionToRoute("orders.goods", orderId);
  },

  actions: {
    mergePackage() {
      if (this.get("orderId")) {
        this.checkoutCart();
      } else {
        this.redirectToRequestPurpose();
      }
    },

    goBack() {
      history.back();
    }
  }
});
