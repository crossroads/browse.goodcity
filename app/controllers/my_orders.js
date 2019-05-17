import applicationController from "./application";
import Ember from "ember";

export default applicationController.extend({
  sortProperties: ["createdAt:desc"],
  arrangedOrders: Ember.computed.sort("model.orders", "sortProperties"),
  orders: Ember.computed.alias("model"),
  flashMessage: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  queryParams: ["submitted"],
  triggerFlashMessage: false,
  previousRouteName: null,
  showCancelBookingPopUp: false,
  cancellationReasonWarning: false,
  applicationController: Ember.inject.controller("application"),
  isMyOrdersRoute: Ember.computed(
    "applicationController.currentPath",
    function() {
      return this.get("applicationController.currentPath") === "my_orders";
    }
  ),

  fetchPackageImages(pkg) {
    return Ember.RSVP.all(
      pkg
        .getWithDefault("imageIds", [])
        .map(id => this.store.findRecord("image", id, { reload: false }))
    );
  },

  fetchMissingImages(order) {
    const ordersPackages = order.getWithDefault("ordersPackages", []);
    return Ember.RSVP.all(
      ordersPackages.map(op => this.fetchPackageImages(op.get("package")))
    );
  },

  submitted: false,

  submittedOrderFlashMessage: Ember.observer(
    "submitted",
    "triggerFlashMessage",
    function() {
      if (
        this.get("submitted") &&
        this.get("previousRouteName") === "order.confirm"
      ) {
        this.get("flashMessage").show("order.flash_submit_message");
      }
    }
  ),

  preloadOrder(order) {
    this.startLoading();
    return this.get("store")
      .findRecord("order", order.get("id"), { reload: true })
      .catch(e => {
        this.stopLoading();
        return Ember.RSVP.reject(e);
      })
      .then(res => {
        this.stopLoading();
        return res;
      });
  },

  actions: {
    viewOrder(order) {
      const id = order.get("id");
      this.preloadOrder(order).then(() => {
        this.transitionToRoute("orders.detail", id);
      });
    },

    editOrder(order) {
      const id = order.get("id");
      this.preloadOrder(order).then(() => {
        this.transitionToRoute("request_purpose", {
          queryParams: {
            bookAppointment: this.get("isAppointmentDraft"),
            orderId: id
          }
        });
      });
    }
  }
});
