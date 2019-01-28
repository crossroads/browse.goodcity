import Ember from 'ember';
import applicationController from './../application';
import AjaxPromise from 'goodcity-for-charities/utils/ajax-promise';
const { getOwner } = Ember;

export default applicationController.extend({
  cart: Ember.inject.service(),
  order: Ember.computed.alias("model.order"),

  isEmptyOrUnavailableOrder(order) {
    if(order) {
      let orderItems = order.get('orderItems');
      if(orderItems.length) {
        return ((orderItems.getEach("allowWebPublish").indexOf(false) >= 0) || orderItems.getEach("allowWebPublish").indexOf(undefined) >= 0);
      }
      return true;
    }
    return true;
  },

  orderParams() {
    return { order: { state_event: "submit" } };
  },

  actions: {
    confirmOrder() {
      var order = this.get('order');
      if(this.isEmptyOrUnavailableOrder(order)) {
        this.get("messageBox").alert(this.get('i18n').t('items_not_available'), () => {
          this.transitionToRoute("cart");
        });
        return false;
      }
      var loadingView = getOwner(this).lookup('component:loading').append();
      new AjaxPromise(`/orders/${order.get('id')}`, "PUT", this.get('session.authToken'), this.orderParams())
        .then(data => {
          this.get("store").pushPayload(data);
          loadingView.destroy();
          this.get('cart').clearItems();
          this.transitionToRoute("my_orders", { queryParams:
            {
              submitted: true
            }
          });
        });
    }
  }
});
