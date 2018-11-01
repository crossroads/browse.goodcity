import Ember from "ember";
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Controller.extend({
  orderId: Ember.computed.alias("model.id"),
  selectedId: null,
  selectedTimeId: null,
	selectedDate: null,

	available_dates: Ember.computed('available_dates.[]', {
    get: function() {
      new AjaxPromise("/available_dates", "GET", this.get('session.authToken'), {schedule_days: 40})
        .then(data => this.set("available_dates", data));
    },
    set: function(key, value) {
      return value;
    }
  }),

  actions: {
  	saveTransportDetails(){
      var requestProperties = {};
      requestProperties.scheduled_at = this.get('selectedDate');
      requestProperties.timeslot = this.get('selectedTimeId');
      requestProperties.transport_type = this.get("selectedId");
      requestProperties.order_id = this.get('orderId');

  		console.log('inside transport');
      var loadingView = getOwner(this).lookup('component:loading').append();

  		new AjaxPromise("/order_transports", "POST", this.get('session.authToken'), { order_transport: requestProperties })
  		.then(data => {
  			this.get("store").pushPayload(data);
        loadingView.destroy();
        this.transitionToRoute("order.confirm_booking", this.get("orderId"));
  			console.log('success');
  		});
  	}
  }
});