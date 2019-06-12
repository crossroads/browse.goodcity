import Ember from "ember";
import AjaxPromise from "browse/utils/ajax-promise";
const { getOwner } = Ember;
import cancelOrder from "../../mixins/cancel_order";

const ONLINE_ORDER_HALF_DAY_SLOT_COUNT = 10;

export default Ember.Controller.extend(cancelOrder, {
  queryParams: ["prevPath"],
  prevPath: null,
  showCancelBookingPopUp: false,
  order: Ember.computed.alias("model.order"),
  orderTransport: Ember.computed.alias("model.orderTransport"),
  myOrders: Ember.inject.controller(),
  settings: Ember.inject.service(),
  selectedId: null,
  selectedTimeId: null,
  selectedDate: null,
  timeSlotNotSelected: false,
  isEditing: false,
  showOrderSlotSelection: false,

  bookingMargin: Ember.computed(function() {
    // To allow time to prepare orders, we set a saftety margin
    // of days in which clients cannot book anything.
    return this.get("settings").readNumber(
      "browse.online_order.timeslots.booking_margin"
    );
  }),

  isAppointment: Ember.computed("order", function() {
    return this.get("order.isAppointment");
  }),
    
  timeSlots: Ember.computed("selectedDate", function() {
    let selectedDate = this.get("selectedDate");
    if (selectedDate) {
      let timeSlots = this.get(
        "available_dates"
      ).appointment_calendar_dates.filter(
        date => date.date === moment(selectedDate).format("YYYY-MM-DD")
      )[0].slots;
      return timeSlots;
    }
  }),

  onlineOrderPickupSlots: Ember.computed("available_dates", function() {
    let results = [];
    let availableDates = this.get(
      "available_dates"
    ).appointment_calendar_dates.slice(this.get("bookingMargin"));

    const atHour = (d, h) => {
      d = new Date(d);
      d.setHours(h);
      d.setMinutes(0);
      d.setSeconds(0);
      return {
        isMorning: h < 12,
        timestamp: d
      };
    };

    const morningOf = d => atHour(d, 10);
    const afternoonOf = d => atHour(d, 14);

    for (let date of 
        ) {
      let slots = date.slots;
      let allowMorning = false;
      let allowAfternoon = false;
      for (let s of slots) {
        let dt = new Date(s.timestamp);
        let isMorning = dt.getHours() < 12;
        let isToday = this.isToday(dt);

        if (isToday) {
          if (isMorning || new Date().getHours() >= 11) {
            // We don't allow booking the current day's morning
            // and we don't allow booking the afternoon if we're past 11am
            continue;
          }
        }

        if (isMorning && !allowMorning) {
          results.push(morningOf(dt));
          allowMorning = true;
        } else if (!allowAfternoon) {
          results.push(afternoonOf(dt));
          allowAfternoon = true;
        }
      }

      if (results.length >= ONLINE_ORDER_HALF_DAY_SLOT_COUNT) {
        break;
      }
    }
    return results;
  }),

  orderTransportParams() {
    let orderTransportProperties = {};
    orderTransportProperties.scheduled_at = this.get("selectedTimeId");
    orderTransportProperties.timeslot = this.get("selectedTimeId").substr(
      11,
      5
    );
    orderTransportProperties.transport_type = this.get("selectedId");
    orderTransportProperties.order_id = this.get("order.id");
    return orderTransportProperties;
  },

  isToday(date) {
    return new Date(date).toDateString() === new Date().toDateString();
  },

  actions: {
    showOrderSlotSelectionOverlay() {
      this.set("showOrderSlotSelection", true);
    },

    selectOnlineOrderSlot(slot) {
      this.set(
        "selectedTimeId",
        moment.tz(slot.timestamp, "Asia/Hong_Kong").format()
      );
      this.set("showOrderSlotSelection", false);
    },

    saveTransportDetails() {
      if (this.get("isAppointment")) {
        const isTimeSlotSelected = Ember.$(".time-slots input")
          .toArray()
          .filter(radioButton => radioButton.checked === true).length;
        if (isTimeSlotSelected) {
          this.set("timeSlotNotSelected", false);
        } else {
          this.set("timeSlotNotSelected", true);
          return false;
        }
      }

      if (!this.get("selectedTimeId")) {
        return false;
      }

      var orderTransport = this.get("orderTransport");

      var url, actionType;

      if (orderTransport) {
        url = "/order_transports/" + orderTransport.get("id");
        actionType = "PUT";
      } else {
        url = "/order_transports";
        actionType = "POST";
      }

      this.send("saveOrUpdateOrderTransport", url, actionType);
    },

    saveOrUpdateOrderTransport(url, actionType) {
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      var previousRouteName = this.get("prevPath");
      var orderId = this.get("order.id");

      new AjaxPromise(url, actionType, this.get("session.authToken"), {
        order_transport: this.orderTransportParams()
      }).then(data => {
        this.get("store").pushPayload(data);
        loadingView.destroy();
        if (previousRouteName === "orders.booking") {
          this.transitionToRoute(previousRouteName, orderId);
        } else {
          this.transitionToRoute("order.confirm_booking", orderId);
        }
      });
    }
  }
});
