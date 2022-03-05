import $ from "jquery";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { alias } from "@ember/object/computed";
import Controller, { inject as controller } from "@ember/controller";
import { getOwner } from "@ember/application";
import AjaxPromise from "browse/utils/ajax-promise";
import cancelOrder from "../../mixins/cancel_order";
import _ from "lodash";

const ONLINE_ORDER_HALF_DAY_SLOT_COUNT = 10;

export default Controller.extend(cancelOrder, {
  queryParams: ["prevPath"],
  prevPath: null,
  showCancelBookingPopUp: false,
  order: alias("model.order"),
  orderTransport: alias("model.orderTransport"),
  myOrders: controller(),
  settings: service(),
  selectedId: null,
  selectedTimeId: null,
  selectedDate: null,
  timeSlotNotSelected: false,
  isEditing: false,
  showOrderSlotSelection: false,

  bookingMargin: computed(function() {
    // To allow time to prepare orders, we set a saftety margin
    // of days in which clients cannot book anything.
    return this.get("settings").readNumber(
      "browse.online_order.timeslots.booking_margin"
    );
  }),

  isAppointment: alias("order.isAppointment"),

  timeSlots: computed("selectedDate", function() {
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

  onlineOrderPickupSlots: computed("available_dates", function() {
    const available_dates = this.get("available_dates");
    const atHour = (d, h) => {
      const isMorning = h < 12;
      const timestamp = new Date(d);

      timestamp.setHours(h, 0, 0, 0);
      return { isMorning, timestamp };
    };

    const toDate = s => new Date(s.timestamp);
    const morningOf = d => atHour(d, 10);
    const afternoonOf = d => atHour(d, 14);

    return _.chain(available_dates)
      .get("appointment_calendar_dates", [])
      .filter(({ slots = [] }) => slots.length > 0)
      .slice(this.get("bookingMargin"))
      .transform((results, entry) => {
        const { date, slots } = entry;
        const hasMorning = slots.map(toDate).find(dt => dt.getHours() < 12);
        const hasAfternoon = slots.map(toDate).find(dt => dt.getHours() >= 12);

        if (hasMorning) {
          results.push(morningOf(date));
        }
        if (hasAfternoon) {
          results.push(afternoonOf(date));
        }

        return results.length < ONLINE_ORDER_HALF_DAY_SLOT_COUNT;
      })
      .value();
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
        const isTimeSlotSelected = $(".time-slots input")
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
      })
        .then(data => {
          this.get("store").pushPayload(data);
          loadingView.destroy();
          if (previousRouteName === "orders.booking") {
            this.transitionToRoute(previousRouteName, orderId);
          } else {
            this.transitionToRoute("order.confirm_booking", orderId);
          }
        })
        .catch(err => {
          this.get("messageBox").alert(err.responseJSON.error, () =>
            this.transitionToRoute("/my_orders")
          );
        });
    }
  }
});
