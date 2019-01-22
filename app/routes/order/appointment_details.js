import Ember from 'ember';
import AuthorizeRoute from './../authorize';
import AjaxPromise from 'browse/utils/ajax-promise';

export default AuthorizeRoute.extend({
  previousRouteName: null,

  beforeModel() {
    this._super(...arguments);
    var previousRoutes = this.router.router && this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();

    if(previousRoute && previousRoute.name)
    {
      this.set("previousRouteName", previousRoute.name);
    }
  },

  model() {
    var orderId = this.paramsFor('order').order_id;
    return Ember.RSVP.hash({
      availableDatesAndtime: new AjaxPromise("/appointment_slots/calendar", "GET", this.get('session.authToken'), {to: moment().add(120, 'days').format('YYYY-MM-DD')}),
      order: this.store.peekRecord('order', orderId) || this.store.findRecord('order', orderId),
      orderTransport: this.store.peekAll("orderTransport").filterBy("order.id", orderId).get("firstObject")
    });
  },

  setUpFormData(model, controller) {
    var selectedId = "self";
    var selectedTime = "11:00am";
    let selectedDate = null;
    let selectedSlot = null;
    let orderTransport = model.orderTransport;
    let availableDatesAndTime = model.availableDatesAndtime;
    let slots = null;
    let order = null;
    controller.set('isEditing', false);
    if (orderTransport){
      selectedId = orderTransport.get('transportType');
      selectedTime = orderTransport.get('timeslot');
      selectedDate = moment.tz(orderTransport.get("scheduledAt"), 'Asia/Hong_Kong');
      order = orderTransport.get('order');
      if(selectedDate) {
        slots = availableDatesAndTime.appointment_calendar_dates.filter( date => date.date === moment(selectedDate).format('YYYY-MM-DD'))[0].slots;
        selectedSlot = slots.filter(slot => slot.timestamp.indexOf(orderTransport.get("timeslot")) >= 0)[0];
      }
      this.setIsEditing(order, controller);
    }
    controller.set('selectedId', selectedId);
    controller.set('selectedTimeId', selectedTime);
    controller.set('available_dates', availableDatesAndTime);
    controller.set('selectedDate', selectedDate);
    if(selectedSlot) {
      controller.set("selectedTimeId", selectedSlot.timestamp);
    }
  },

  setIsEditing(order, controller){
    if(order.get('isDraft')){
      controller.set('isEditing', false);
    } else {
      controller.set('isEditing', true);
    }
  },

  setupController(controller, model) {
    this._super(...arguments);
    this.setUpFormData(model, controller);
    controller.set("previousRouteName", this.get("previousRouteName"));
    if(this.get("previousRouteName") === "my_orders") {
      this.controllerFor('my_orders').set("selectedOrder", model.order);
    } else {
      this.controllerFor('my_orders').set("selectedOrder", null);
    }
    this.controllerFor('application').set('showSidebar', false);
  },

  deactivate(){
    this.controllerFor('application').set('showSidebar', true);
  }
});
