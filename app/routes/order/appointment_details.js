import Ember from 'ember';
import AuthorizeRoute from './../authorize';
import AjaxPromise from 'browse/utils/ajax-promise';

export default AuthorizeRoute.extend({
  model() {
    var orderId = this.paramsFor('order').order_id;
    return Ember.RSVP.hash({
      availableDates: new AjaxPromise("/available_dates", "GET", this.get('session.authToken'), {schedule_days: 40}),
      order: this.store.peekRecord('order', orderId) || this.store.findRecord('order', orderId),
      orderTransport: this.store.peekAll("orderTransport").filterBy("order.id", orderId).get("firstObject")
    });
  },

  setUpFormData(model, controller) {
    var selectedId = "self";
    var selectedTime = "11:00am";
    if (model.orderTransport){
      selectedId = model.orderTransport.get('transportType');
      selectedTime = model.orderTransport.get('timeslot');
    }
    controller.set('selectedId', selectedId);
    controller.set('selectedTimeId', selectedTime);
    controller.set('available_dates', model.availableDates);
  },

  setupController(controller, model) {
    this._super(...arguments);
    this.setUpFormData(model, controller);
    this.controllerFor('application').set('showSidebar', false);
  },
  
  deactivate(){
    this.controllerFor('application').set('showSidebar', true);
  }
});
