import { computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import applicationController from "./../application_root";
import AjaxPromise from "browse/utils/ajax-promise";
import cancelOrderMixin from "../../mixins/cancel_order";

export default applicationController.extend(cancelOrderMixin, {
  order: alias("model.order"),
  showCancelBookingPopUp: false,
  unreadMessageCount: computed("order", function() {
    return this.get("order.unreadMessagesCount");
  }),
  hasUnreadMessages: computed("order", function() {
    return this.get("order.hasUnreadMessages");
  }),

  actions: {
    redirectToEdit(routeName) {
      let orderId = this.get("order.id");
      this.transitionToRoute(`order.${routeName}`, orderId, {
        queryParams: { prevPath: "orders.booking" }
      });
    },

    editRequestPurpose() {
      let orderId = this.get("order.id");
      this.transitionToRoute(`request_purpose`, {
        queryParams: {
          orderId: orderId,
          bookAppointment: false,
          editRequest: true,
          prevPath: "orders.booking"
        }
      });
    },

    cancelBookingPopUp() {
      this.set("showCancelBookingPopUp", true);
    },
    removePopUp() {
      this.set("showCancelBookingPopUp", false);
    }
  }
});
