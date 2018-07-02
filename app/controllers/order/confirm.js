import Ember from 'ember';
import applicationController from './../application';
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;

export default applicationController.extend({
  cart: Ember.inject.service(),
  order: Ember.computed.alias("model.order"),

  actions: {
    confirmOrder() {
      var order = this.get('order');
      var orderItems = order.get('orderItems');
      if(orderItems.length && orderItems.getEach("allowWebPublish").includes(false)) {
        this.get("messageBox").alert(this.get('i18n').t('items_not_available'), () => {
          this.transitionToRoute("cart");
        });
        return false;
      }
      var loadingView = getOwner(this).lookup('component:loading').append();
      var orderParams = {
        state_event: "submit"
      };
      new AjaxPromise(`/orders/${order.get('id')}`, "PUT", this.get('session.authToken'), { order: orderParams })
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
