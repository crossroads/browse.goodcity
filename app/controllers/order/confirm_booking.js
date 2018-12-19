import Ember from "ember";
import config from '../../config/environment';
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;
export default Ember.Controller.extend({
  isMobileApp: config.cordova.enabled,
  order: Ember.computed.alias("model"),

	actions: {
		confirmBooking(){
			console.log('confirmation');
			var order = this.get('order');
			var loadingView = getOwner(this).lookup('component:loading').append();
      var orderParams = {
        state_event: "submit"
      };
      new AjaxPromise(`/orders/${order.get('id')}`, "PUT", this.get('session.authToken'), { order: orderParams })
      .then(data => {
        this.get("store").pushPayload(data);
        loadingView.destroy();
        this.transitionToRoute('order.booking_success', this.get("order.id"));
      });
		}
	}
});
