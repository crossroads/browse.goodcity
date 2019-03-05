import Ember from "ember";
import config from '../../config/environment';
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;
import cancelOrder from '../../mixins/cancel_order';

export default Ember.Controller.extend(cancelOrder, {
  showCancelBookingPopUp: false,
  isMobileApp: config.cordova.enabled,
  messageBox: Ember.inject.service(),
  order: Ember.computed.alias("model"),
  cart: Ember.inject.service(),

  isEmptyOrUnavailableOrder(order) {
    if(order) {
      let cartItems = this.get("cart.content");
      if(cartItems.length === 0 || (cartItems.length && cartItems.filterBy('available', 0).length > 0) || order.get("ordersPackages.length") === 0) {
        return true;
      }
      return false;
    }
    return true;
  },

	actions: {
		confirmBooking(){
      let order = this.get('order');

      if(order.get('isOnlineOrder') && this.isEmptyOrUnavailableOrder(order)) {
        this.get("messageBox").alert(this.get('i18n').t('items_not_available'), () => {
          this.transitionToRoute("cart");
        });
        return false;
      }

			let loadingView = getOwner(this).lookup('component:loading').append();
      let orderParams = {
        state_event: "submit"
      };

      new AjaxPromise(`/orders/${order.get('id')}`, "PUT", this.get('session.authToken'), { order: orderParams })
        .then(data => {
          this.get("store").pushPayload(data);
          loadingView.destroy();
          if (order.get('isOnlineOrder')) {
            this.get('cart').clearItems();
          }
          this.transitionToRoute('order.booking_success', this.get("order.id"));
        });
		}
	}
});
