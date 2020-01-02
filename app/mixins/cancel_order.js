import $ from "jquery";
import { inject as service } from "@ember/service";
import Mixin from "@ember/object/mixin";
import { getOwner } from "@ember/application";
import asyncMixin from "browse/mixins/async_tasks";

export default Mixin.create({
  orderService: service(),

  deleteOrder(order) {
    this.runTask(
      this.get("orderService")
        .deleteOrder(order)
        .then(() => {
          this.set("showCancelBookingPopUp", false);
          this.transitionToRoute("home");
        })
        .catch(e => {
          this.get("messageBox").alert();
        })
    );
  },

  cancelOrder(order) {
    const div = $(`.cancel-appointment-reasons${order.id}`);
    const cancellationReason = div.val().trim();

    this.set("cancellationReasonWarning", !cancellationReason);

    if (!cancellationReason) {
      div.addClass("cancel-booking-error");
      return false;
    }

    div.removeClass("cancel-booking-error");

    this.runTask(
      this.get("orderService")
        .cancelOrder(order, cancellationReason)
        .then(() => {
          this.set("showCancelBookingPopUp", false);
          this.transitionToRoute("home");
        })
        .catch(e => {
          this.get("messageBox").alert();
        })
    );
  },

  actions: {
    cancelBookingPopUp() {
      this.set("showCancelBookingPopUp", true);
    },

    removePopUp() {
      this.set("showCancelBookingPopUp", false);
    },

    cancelOrder(order) {
      order = order || this.get("order");
      if (order) {
        if (order.get("isDraft")) {
          this.deleteOrder(order);
        } else if (order.get("isCancelAllowed")) {
          this.cancelOrder(order);
        }
      }
    }
  }
});
