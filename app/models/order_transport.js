import { computed } from "@ember/object";
import { equal, not } from "@ember/object/computed";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";

export default Model.extend({
  timeslot: attr("string"),
  transportType: attr("string"),
  vehicleType: attr("string"),
  scheduledAt: attr("date"),
  orderId: attr("number"),

  contact: belongsTo("contact", { async: false }),
  order: belongsTo("order", { async: false }),
  gogovanTransport: belongsTo("gogovan_transport", { async: false }),

  isGGV: equal("transportType", "ggv"),

  needEnglish: attr("boolean"),
  needCart: attr("boolean"),
  needCarry: attr("boolean"),
  needOverSixFt: attr("boolean"),
  removeNet: attr("string"),

  scheduledDate: computed("scheduledAt", function() {
    return moment(this.get("scheduledAt")).format("ddd LL");
  }),

  isMorning: computed("scheduledAt", function() {
    return moment.tz(this.get("scheduledAt"), "Asia/Hong_Kong").hour() < 12;
  }),

  isAfternoon: not("isMorning"),

  type: computed("transportType", function() {
    var type = this.get("transportType");
    if (type === "ggv") {
      return type.toUpperCase();
    } else if (type === "self") {
      return type.charAt(0).toUpperCase() + type.slice(1);
    } else {
      return "";
    }
  }),

  isDelivery: computed("transportType", function() {
    return this.get("transportType") === "ggv";
  }),

  isAppointment: computed("bookingType", function() {
    const bookingType = this.get("bookingType");
    if (!bookingType) {
      // Orders created before appointments were supported may not have bookingTypes
      return false;
    }
    return bookingType.get("isAppointment");
  })
});
