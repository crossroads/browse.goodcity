import Ember from "ember";
import applicationController from './../application';
import AjaxPromise from 'browse/utils/ajax-promise';


export default applicationController.extend({
  order: Ember.computed.alias('model.order'),
  showCancelBookingPopUp: false,
  unreadMessageCount: Ember.computed('order', function(){
    return this.get('order.unreadMessagesCount');
  }),
  hasUnreadMessages: Ember.computed('order', function () {
    return this.get('order.hasUnreadMessages');
  }),

  deleteOrder(order) {
    var _this = this;
    this.showLoadingSpinner();
    new AjaxPromise("/orders/" + order.id, "DELETE", _this.get('session.authToken'))
      .then(data => {
        _this.get("cart").clearItems();
        if(order) {
          _this.store.pushPayload(data);
          _this.store.unloadRecord(order);
        }
      })
      .catch(() => {
        this.get("messageBox").alert();
      })
      .finally(() => {
        this.hideLoadingSpinner();
        this.set("showCancelBookingPopUp", false);
        _this.transitionToRoute("home");
      });
  },

  cancelOrder(order) {
    let cancellationReason = Ember.$(`#appointment-cancellation-reason`).val().trim();
    if(!cancellationReason.length) {
      this.set("cancellationReasonWarning", true);
      Ember.$('#appointment-cancellation-reason').addClass("cancel-booking-error");
      return false;
    } else {
      Ember.$('#appointment-cancellation-reason').removeClass("cancel-booking-error");
      this.set("cancellationReasonWarning", false);
    }
    var url = `/orders/${order.id}/transition`;
    this.showLoadingSpinner();
    new AjaxPromise(url, "PUT", this.get('session.authToken'), { transition: "cancel", cancellation_reason: cancellationReason })
      .then(data => {
        this.get("store").pushPayload(data);
      })
      .catch(() => {
        this.get("messageBox").alert();
      })
      .finally(() => {
        this.hideLoadingSpinner();
        this.set("showCancelBookingPopUp", false);
      });
  },

  showLoadingSpinner() {
    if (Ember.testing) {
      return;
    }
    if (!this.loadingView) {
      this.loadingView = Ember.getOwner(this).lookup('component:loading').append();
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
      this.transitionToRoute(`order.${routeName}`, orderId, { queryParams: { prevPath: "orders.booking" } });
    },

    editRequestPurpose() {
      let orderId = this.get("order.id");
      this.transitionToRoute(`request_purpose`,
        {
          queryParams: {
            orderId: orderId,
            bookAppointment: false,
            editRequest: true,
            prevPath: 'orders.booking'
          }
        });
    },

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
    },
  }
});
