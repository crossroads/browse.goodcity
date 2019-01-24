import Ember from 'ember';
import AuthorizeRoute from './../authorize';
import AjaxPromise from 'browse/utils/ajax-promise';

export default AuthorizeRoute.extend({
  previousRouteName: null,

  filteredCalenderDatesWithOrderTransport(calendarDates, orderTransportScheduledAt) {
    return calendarDates.filter(dateAndSlots => dateAndSlots.date === orderTransportScheduledAt)[0];
  },

  slotExitsWithNoQuota(calendarDates, orderTransportScheduledAt, orderTransport) {
    let filteredDates = this.filteredCalenderDatesWithOrderTransport(calendarDates, orderTransportScheduledAt);
    return function() {
      return filteredDates.slots.filter(slot => slot.timestamp.indexOf(orderTransportScheduledAt + "T" + orderTransport.get("timeslot")) >= 0 );
    };
  },

  getBookedSlot(orderTransportScheduledAt, orderTransport) {
    return {
      id: null,
      isClosed: false,
      note: "",
      quota: 1,
      remaining: 1,
      timestamp: orderTransportScheduledAt + "T" + orderTransport.get("timeslot") + ":00.000+08:00"
    };
  },

  getCalenderDate(orderTransportScheduledAt, bookedSlot) {
    return {
      date: orderTransportScheduledAt,
      isClosed: false,
      slots: [bookedSlot]
    };
  },

  //Checks if date is closed, slot is closed or available
  //Adds slot according to that
  addSelectedOrderTransportSlot(calendarDates, orderTransport) {
    let orderTransportScheduledAt = moment.tz(orderTransport.get("scheduledAt"), 'Asia/Hong_Kong').format("YYYY-MM-DD");
    let transportDate = this.filteredCalenderDatesWithOrderTransport(calendarDates, orderTransportScheduledAt);
    let remainingQuota = this.slotExitsWithNoQuota(calendarDates, orderTransportScheduledAt, orderTransport);
    let bookedSlot = this.getBookedSlot(orderTransportScheduledAt, orderTransport);
    if(transportDate) {
      //If no slots are available then push single slot
      if(transportDate.isClosed) {
        calendarDates.filter(dateAndSlots => dateAndSlots.date === orderTransportScheduledAt).isClosed = false; // jshint ignore:line
        calendarDates.filter(dateAndSlots => dateAndSlots.date === orderTransportScheduledAt)[0].slots.unshift(bookedSlot); // jshint ignore:line
      } else if (remainingQuota = remainingQuota()) {
        //If slot is available and remaining quota is 0 then push the slot
        if(remainingQuota && remainingQuota.length && remainingQuota[0].remaining === 0) {
          calendarDates.filter(dateAndSlots => dateAndSlots.date === orderTransportScheduledAt)[0].slots.unshift(bookedSlot); // jshint ignore:line
        }
      }
    } else {
      //If scheduled date is past today's date
      let calendarDate = this.getCalenderDate(orderTransportScheduledAt, bookedSlot);
      calendarDates.unshift(calendarDate);
    }
    return calendarDates;
  },

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
    let availableSlots = null;
    let order = null;
    controller.set('isEditing', false);
    if (orderTransport){
      selectedId = orderTransport.get('transportType');
      selectedTime = orderTransport.get('timeslot');
      selectedDate = moment.tz(orderTransport.get("scheduledAt"), 'Asia/Hong_Kong');

      //Logic for Show already selected slot/quota
      let calendarDates = availableDatesAndTime.appointment_calendar_dates;
      calendarDates = this.addSelectedOrderTransportSlot(calendarDates, orderTransport);

      order = orderTransport.get('order');
      if(selectedDate) {
        availableSlots = calendarDates.filter( date => date.date === moment(selectedDate).format('YYYY-MM-DD'))[0];
        selectedSlot = availableSlots && availableSlots.slots.filter(slot => slot.timestamp.indexOf(orderTransport.get("timeslot")) >= 0)[0];
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
