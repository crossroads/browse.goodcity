import { hash, resolve } from "rsvp";
import AuthorizeRoute from "./../authorize";
import AjaxPromise from "browse/utils/ajax-promise";

export default AuthorizeRoute.extend({
  filteredCalenderDatesWithOrderTransport(
    calendarDates,
    orderTransportScheduledAt
  ) {
    return calendarDates.filter(
      dateAndSlots => dateAndSlots.date === orderTransportScheduledAt
    )[0];
  },

  slotExitsWithNoQuota(
    calendarDates,
    orderTransportScheduledAt,
    orderTransport
  ) {
    let filteredDates = this.filteredCalenderDatesWithOrderTransport(
      calendarDates,
      orderTransportScheduledAt
    );
    return function() {
      return filteredDates.slots.filter(
        slot =>
          slot.timestamp.indexOf(
            orderTransportScheduledAt + "T" + orderTransport.get("timeslot")
          ) >= 0
      );
    };
  },

  makeBookedSlot(orderTransport) {
    return {
      id: null,
      isClosed: false,
      note: "",
      quota: 1,
      remaining: 1,
      timestamp: moment
        .tz(orderTransport.get("scheduledAt"), "Asia/Hong_Kong")
        .format()
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
    let orderTransportScheduledAt = moment
      .tz(orderTransport.get("scheduledAt"), "Asia/Hong_Kong")
      .format("YYYY-MM-DD");
    let transportDate = this.filteredCalenderDatesWithOrderTransport(
      calendarDates,
      orderTransportScheduledAt
    );
    let remainingQuota = this.slotExitsWithNoQuota(
      calendarDates,
      orderTransportScheduledAt,
      orderTransport
    );
    let bookedSlot = this.makeBookedSlot(orderTransport);
    if (transportDate) {
      //If no slots are available then push single slot
      if (transportDate.isClosed) {
        calendarDates.filter(
          dateAndSlots => dateAndSlots.date === orderTransportScheduledAt
        ).isClosed = false; // jshint ignore:line
        calendarDates
          .filter(
            dateAndSlots => dateAndSlots.date === orderTransportScheduledAt
          )[0]
          .slots.unshift(bookedSlot); // jshint ignore:line
      } else if ((remainingQuota = remainingQuota())) {
        //If slot is available and remaining quota is 0 then push the slot
        if (
          remainingQuota &&
          remainingQuota.length &&
          remainingQuota[0].remaining === 0
        ) {
          calendarDates
            .filter(
              dateAndSlots => dateAndSlots.date === orderTransportScheduledAt
            )[0]
            .slots.unshift(bookedSlot); // jshint ignore:line
        }
      }
    } else {
      //If scheduled date is past today's date
      let calendarDate = this.getCalenderDate(
        orderTransportScheduledAt,
        bookedSlot
      );
      calendarDates.unshift(calendarDate);
    }
    return calendarDates;
  },

  loadOrder(orderId) {
    const cachedOrder = this.store.peekRecord("order", orderId);
    return cachedOrder
      ? resolve(cachedOrder)
      : this.store.findRecord("order", orderId);
  },

  model() {
    var orderId = this.paramsFor("order").order_id;
    return this.loadOrder(orderId).then(order => {
      return hash({
        availableDatesAndtime: new AjaxPromise(
          "/appointment_slots/calendar",
          "GET",
          this.get("session.authToken"),
          {
            booking_type_id: order.get("bookingTypeId"),
            to: moment()
              .add(120, "days")
              .format("YYYY-MM-DD")
          }
        ),
        order: order,
        orderTransport: this.store
          .peekAll("orderTransport")
          .filterBy("order.id", orderId)
          .get("firstObject")
      });
    });
  },

  setUpFormData(model, controller) {
    var transportType = "self";
    var selectedTime = "11:00am";
    let selectedDate = null;
    let selectedSlot = null;
    let orderTransport = model.orderTransport;
    let availableDatesAndTime = model.availableDatesAndtime;
    let availableSlots = null;
    let order = model.order;
    controller.set("isEditing", false);
    if (orderTransport) {
      transportType = orderTransport.get("transportType");
      selectedTime = orderTransport.get("timeslot");
      selectedDate = moment.tz(
        orderTransport.get("scheduledAt"),
        "Asia/Hong_Kong"
      );

      //Logic for Show already selected slot/quota
      let calendarDates = availableDatesAndTime.appointment_calendar_dates;
      calendarDates = this.addSelectedOrderTransportSlot(
        calendarDates,
        orderTransport
      );

      order = orderTransport.get("order");
      if (selectedDate) {
        availableSlots = calendarDates.filter(
          date => date.date === moment(selectedDate).format("YYYY-MM-DD")
        )[0];
        selectedSlot =
          availableSlots &&
          availableSlots.slots.filter(
            slot => slot.timestamp.indexOf(orderTransport.get("timeslot")) >= 0
          )[0];
      }
      controller.set("isEditing", !order.get("isDraft"));
    }
    controller.set("transportType", transportType);
    controller.set("selectedTimeId", selectedDate && selectedDate.format());
    controller.set("available_dates", availableDatesAndTime);
    controller.set("selectedDate", selectedDate);
    if (selectedSlot) {
      controller.set("selectedTimeId", selectedSlot.timestamp);
    }
  },

  afterModel() {
    window.scrollTo(0, 0); //https://github.com/dollarshaveclub/ember-router-scroll. Read this link for nested route issue for not scrolling at top of the page
  },

  async setupController(controller, model) {
    this._super(...arguments);
    this.setUpFormData(model, controller);
    this.controllerFor("application").set("showSidebar", false);
    controller.set("showOrderSlotSelection", false);
    await controller.onControllerLoad();
  },

  deactivate() {
    this.controllerFor("application").set("showSidebar", true);
  }
});
