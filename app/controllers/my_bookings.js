import { reject } from "rsvp";
import { sort, alias } from "@ember/object/computed";
import applicationController from "./application";
import { inject as service } from "@ember/service";

export default applicationController.extend({
  orders: alias("model"),

  sortProperties: ["createdAt:desc"],
  arrangedOrders: sort("model.orders", "sortProperties"),

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
            orderId: id,
            prevPath: "my_orders"
          }
        });
      });
    }
  }
});
