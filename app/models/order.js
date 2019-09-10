import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo, hasMany } from "ember-data/relationships";

export default Model.extend({
  store: Ember.inject.service(),
  code: attr("string"),
  state: attr("string"),
  purposeDescription: attr("string"),
  orderType: attr("string"),
  ordersPackages: hasMany("orders_packages", {
    async: false
  }),
  orderTransportId: attr("string"),
  orderTransport: belongsTo("order_transport", {
    async: false
  }),
  address: belongsTo("address", {
    async: false
  }),
  organisation: belongsTo("organisation", {
    async: false
  }),
  createdById: belongsTo("user", {
    async: false
  }),
  createdAt: attr("date"),
  updatedAt: attr("date"),
  detailType: attr("string"),
  districtId: attr("number"),
  messages: hasMany("message", {
    async: false
  }),
  ordersPurposes: hasMany("orders_purpose", {
    async: false
  }),
  beneficiaryId: attr("string"),
  bookingTypeId: attr("number"),
  beneficiary: belongsTo("beneficiary", {
    async: true
  }),
  peopleHelped: attr("number"),
  goodcityRequests: hasMany("goodcity_request", {
    async: false
  }),
  district: belongsTo("district", {
    async: false
  }),
  bookingType: belongsTo("booking_type", {
    async: false
  }),

  isGoodCityOrder: Ember.computed.equal("detailType", "GoodCity"),
  isDraft: Ember.computed.equal("state", "draft"),
  isSubmitted: Ember.computed.equal("state", "submitted"),
  isAwaitingDispatch: Ember.computed.equal("state", "awaiting_dispatch"),
  isDispatching: Ember.computed.equal("state", "dispatching"),
  isClosed: Ember.computed.equal("state", "closed"),
  isProcessing: Ember.computed.equal("state", "processing"),
  isCancelled: Ember.computed.equal("state", "cancelled"),
  intl: Ember.inject.service(),

  isAppointment: Ember.computed("bookingType", function() {
    return this.get("bookingType.isAppointment");
  }),

  isOnlineOrder: Ember.computed("bookingType", function() {
    return this.get("bookingType.isOnlineOrder");
  }),

  // only to show ordersPackages on confirmation screen
  orderItems: Ember.computed("ordersPackages.[]", function() {
    var items = [];
    this.get("ordersPackages").forEach(function(record) {
      if (record) {
        var pkg = record.get("package");
        items.push(pkg);
      }
    });
    return items.uniq();
  }),

  isAppointmentDraft: Ember.computed("state", "orderType", function() {
    return this.get("isAppointment") && this.get("isDraft");
  }),

  isOnlineOrderDraft: Ember.computed("state", "orderType", function() {
    return this.get("isOnlineOrder") && this.get("isDraft");
  }),

  isEditAllowed: Ember.computed("state", function() {
    let editableStates = [
      "draft",
      "submitted",
      "processing",
      "restart_process",
      "awaiting_dispatch"
    ];
    return editableStates.indexOf(this.get("state")) >= 0;
  }),

  isCancelAllowed: Ember.computed("state", function() {
    let cancellableStates = [
      "submitted",
      "processing",
      "restart_process",
      "awaiting_dispatch"
    ];
    return cancellableStates.indexOf(this.get("state")) >= 0;
  }),

  clientIdType: Ember.computed(
    "beneficiary",
    "beneficiary.identityType",
    function() {
      return this.get("beneficiary.identityType.name");
    }
  ),

  clientIdNumber: Ember.computed.alias("beneficiary.identityNumber"),

  clientName: Ember.computed.alias("beneficiary.fullName"),

  clientPhone: Ember.computed.alias("beneficiary.phoneNumber"),

  appointmentTransport: Ember.computed(
    "orderTransport.transportType",
    function() {
      let intl = this.get("intl");
      return this.get("orderTransport.transportType") === "self"
        ? intl.t("order.appointment.self_vehicle")
        : intl.t("order.appointment.hire_vehicle");
    }
  ),

  appointmentDate: Ember.computed("orderTransport.scheduledAt", function() {
    let orderTransport = this.get("orderTransport");
    if (!orderTransport) {
      return "";
    }
    return moment(orderTransport.get("scheduledAt")).format("dddd MMMM Do");
  }),

  appointmentTime: Ember.computed(
    "appointmentDate",
    "orderTransport.timeslot",
    function() {
      let orderTransport = this.get("orderTransport");
      if (!orderTransport) {
        return "";
      }
      return `${this.get("appointmentDate")}, ${orderTransport.get(
        "timeslot"
      )}`;
    }
  ),

  stateIcon: Ember.computed("state", function() {
    const state = this.get("state");
    switch (state) {
      case "awaiting_dispatch":
      case "scheduled":
        return "clock";
      case "processing":
        return "list";
      case "submitted":
        return "envelope";
      case "dispatching":
        return "paper-plane";
      case "cancelled":
        return "thumbs-down";
      case "closed":
        return "lock";
      case "draft":
        return "pencil-alt";
      default:
        return "";
    }
  }),

  purposeName: Ember.computed("ordersPurposes.[]", function() {
    return this.get("ordersPurposes.firstObject.purpose.description");
  }),

  transportIcon: Ember.computed("transportKey", function() {
    const key = this.get("transportKey");
    switch (key) {
      case "gogovan_transport":
        return "truck";
      case "collection_transport":
        return "male";
      default:
        return "";
    }
  }),

  transportLabel: Ember.computed("transportKey", function() {
    const key = this.get("transportKey");
    return this.get("intl").t(`my_orders.order_transports.${key}`);
  }),

  transportKey: Ember.computed("orderTransport.transportType", function() {
    const transportId = this.get("orderTransportId");
    if (
      !transportId ||
      !this.get("store").peekRecord("order_transport", transportId)
    ) {
      return "unknown_transport";
    }

    const transportType = this.get("orderTransport.transportType");
    switch (transportType) {
      case "ggv":
        return "gogovan_transport";
      case "self":
        return "collection_transport";
      default:
        return "unknown_transport";
    }
  }),

  // unread order messages
  unreadMessagesCount: Ember.computed("messages.@each.state", function() {
    return this.get("messages").filterBy("state", "unread").length;
  }),

  hasUnreadMessages: Ember.computed("unreadMessagesCount", function() {
    return this.get("unreadMessagesCount") > 0;
  })
});
