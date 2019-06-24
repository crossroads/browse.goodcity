import Ember from "ember";
const { getOwner } = Ember;
import AjaxPromise from "browse/utils/ajax-promise";

export default Ember.Mixin.create({
  orderService: Ember.inject.service(),

  deleteOrder(order) {
    var loadingView = getOwner(this)
      .lookup("component:loading")
      .append();

    this.get("orderService")
      .deleteOrder(order)
      .then(() => {
        this.set("showCancelBookingPopUp", false);
        this.transitionToRoute("home");
      })
      .catch(e => {
        this.get("messageBox").alert();
      })
      .finally(() => {
        loadingView.destroy();
      });
  },

  cancelOrder(order) {
    const div = Ember.$(`#cancel-appointment-reason${order.id}`);
    const cancellationReason = div.val().trim();

    this.set("cancellationReasonWarning", !cancellationReason);

    if (!cancellationReason) {
      div.addClass("cancel-booking-error");
      return false;
    }

    div.removeClass("cancel-booking-error");

    var loadingView = getOwner(this)
      .lookup("component:loading")
      .append();
    this.get("orderService")
      .cancelOrder(order, cancellationReason)
      .then(() => {
        this.set("showCancelBookingPopUp", false);
        this.transitionToRoute("home");
      })
      .catch(e => {
        this.get("messageBox").alert();
      })
      .finally(() => {
        loadingView.destroy();
      });
  },

  actions: {
    cancelBookingPopUp() {
      this.set("showCancelBookingPopUp", true);
    },

    removePopUp() {
      this.set("showCancelBookingPopUp", false);
    },

    cancelOrder() {
      let order = this.get("order");
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
