import Ember from "ember";
const { getOwner } = Ember;
import AjaxPromise from 'browse/utils/ajax-promise';

export default Ember.Mixin.create({
  showCancelBookingPopUp: false,

  deleteOrder(order) {
    var _this = this;
    var loadingView = getOwner(this).lookup('component:loading').append();
    new AjaxPromise("/orders/" + order.id, "DELETE", _this.get('session.authToken'))
    .then(data => {
      _this.get("cart").clearItems();
      _this.get("store").pushPayload(data);
      if(order) {
        _this.store.unloadRecord(order);
      }
      loadingView.destroy();
      _this.set("showCancelBookingPopUp", false);
      _this.transitionToRoute("home");
    });
  },

  cancelOrder(order) {
    let cancellationReason = Ember.$(`#cancel-appointment-reason${order.id}`).val().trim();
    if(!cancellationReason.length) {
      this.set("cancellationReasonWarning", true);
      Ember.$(`#cancel-appointment-reason${order.id}`).addClass("cancel-booking-error");
      return false;
    } else {
      Ember.$(`#cancel-appointment-reason${order.id}`).removeClass("cancel-booking-error");
      this.set("cancellationReasonWarning", false);
    }
    var url = `/orders/${order.id}/transition`;
    var loadingView = getOwner(this).lookup('component:loading').append();
    new AjaxPromise(url, "PUT", this.get('session.authToken'), { transition: "cancel", cancellation_reason: cancellationReason })
      .then(data => {
        this.get("store").pushPayload(data);
      })
      .catch(() => {
        this.get("messageBox").alert();
      })
      .finally(() => {
        loadingView.destroy();
        this.set("showCancelBookingPopUp", false);
        this.transitionToRoute("home");
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
      if(order) {
        if(order.get("isDraft")) {
          this.deleteOrder(order);
        } else if(order.get("isCancelAllowed")) {
          this.cancelOrder(order);
        }
      }
    }
  }
});

