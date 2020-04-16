import { all, reject } from "rsvp";
import { computed, observer } from "@ember/object";
import { inject as controller } from "@ember/controller";
import { inject as service } from "@ember/service";
import { sort, alias } from "@ember/object/computed";
import applicationController from "./application";

export default applicationController.extend({
  sortProperties: ["createdAt:desc"],
  arrangedOrders: sort("model.orders", "sortProperties"),
  orders: alias("model"),
  flashMessage: service(),
  messageBox: service(),
  queryParams: ["submitted"],
  triggerFlashMessage: false,
  showCancelBookingPopUp: false,
  cancellationReasonWarning: false,
  applicationController: controller("application"),
  isMyOrdersRoute: computed("applicationController.currentPath", function() {
    return this.get("applicationController.currentPath") === "my_orders";
  }),

  fetchPackageImages(pkg) {
    return all(
      pkg
        .getWithDefault("imageIds", [])
        .map(id => this.store.findRecord("image", id, { reload: false }))
    );
  },

  fetchMissingImages(order) {
    const ordersPackages = order.getWithDefault("ordersPackages", []);
    return all(
      ordersPackages.map(op => this.fetchPackageImages(op.get("package")))
    );
  },

  submitted: false,

  submittedOrderFlashMessage: observer(
    "submitted",
    "triggerFlashMessage",
    function() {
      if (this.get("submitted")) {
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
        return reject(e);
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
