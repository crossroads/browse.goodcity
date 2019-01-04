import Ember from "ember";
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;
import cancelOrder from '../../mixins/cancel_order';

export default Ember.Controller.extend(cancelOrder, {
  showCancelBookingPopUp: false,
  order: Ember.computed.alias("model.order"),
  orderTransport: Ember.computed.alias('model.orderTransport'),
  myOrders: Ember.inject.controller(),
  selectedId: null,
  selectedTimeId: null,
  selectedDate: null,
  timeSlotNotSelected: false,
  isEditing: false,
  previousRouteName: null,

  timeSlots: Ember.computed('selectedDate', function(){
    var selectedDate = this.get('selectedDate');
    if(selectedDate){
      var timeSlots = this.get('available_dates').appointment_calendar_dates.filter( date => date.date === moment(selectedDate).format('YYYY-MM-DD'))[0].slots;
      return timeSlots;
    }
  }),

  orderTransportParams(){
    var orderTransportProperties = {};
    orderTransportProperties.scheduled_at = this.get('selectedTimeId');
    orderTransportProperties.timeslot = this.get('selectedTimeId').substr(11, 5);
    orderTransportProperties.transport_type = this.get("selectedId");
    orderTransportProperties.order_id = this.get('order.id');
    orderTransportProperties.booking_type_id = this.store.peekAll('booking_type').filterBy('nameEn', 'appointment').get('firstObject.id');
    return orderTransportProperties;
  },

  actions: {
  	saveTransportDetails(){
      const isTimeSlotSelected = Ember.$('.time-slots input').toArray().filter(radioButton => radioButton.checked === true).length;
      if(isTimeSlotSelected) {
        this.set("timeSlotNotSelected", false);
      } else {
        this.set("timeSlotNotSelected", true);
        return false;
      }
      var orderTransport = this.get('orderTransport');

      var url, actionType;

      if (orderTransport) {
        url = "/order_transports/" + orderTransport.get('id');
        actionType = "PUT";
      } else {
        url = "/order_transports";
        actionType = "POST";
      }

      this.send('saveOrUpdateOrderTransport', url, actionType);
    },

    saveOrUpdateOrderTransport(url, actionType){
      var loadingView = getOwner(this).lookup('component:loading').append();

      new AjaxPromise(url, actionType, this.get('session.authToken'), { order_transport: this.orderTransportParams() })
      .then(data => {
        this.get("store").pushPayload(data);
        loadingView.destroy();
        if(this.get("previousRouteName") === "my_orders") {
          this.get("myOrders").set("selectedOrder", this.get("order"));
          this.transitionToRoute('my_orders');
        } else {
          this.transitionToRoute("order.confirm_booking", this.get("order.id"));
        }
      });
    }
  }
});
