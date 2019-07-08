import Ember from "ember";
import applicationController from "./../application";
import AjaxPromise from "browse/utils/ajax-promise";
import cancelOrderMixin from "../../mixins/cancel_order";

export default applicationController.extend(cancelOrderMixin, {
  order: Ember.computed.alias("model.order"),
  showCancelBookingPopUp: false,
  unreadMessageCount: Ember.computed("order", function() {
    return this.get("order.unreadMessagesCount");
  }),
  hasUnreadMessages: Ember.computed("order", function() {
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
