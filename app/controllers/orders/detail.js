import Ember from "ember";
import applicationController from "./../application";
import AjaxPromise from "browse/utils/ajax-promise";
import cancelOrder from "../../mixins/cancel_order";

export default applicationController.extend(cancelOrder, {
  order: Ember.computed.alias("model.order"),
  showCancelBookingPopUp: false,
  unreadMessageCount: Ember.computed("order", function() {
    return this.get("order.unreadMessagesCount");
  }),
  hasUnreadMessages: Ember.computed("order", function() {
    return this.get("order.hasUnreadMessages");
  }),

  showLoadingSpinner() {
    if (Ember.testing) {
      return;
    }
    if (!this.loadingView) {
      this.loadingView = Ember.getOwner(this)
        .lookup("component:loading")
        .append();
    }
  },

  hideLoadingSpinner() {
    if (Ember.testing) {
      return;
    }
    if (this.loadingView) {
      this.loadingView.destroy();
      this.loadingView = null;
    }
  },

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
