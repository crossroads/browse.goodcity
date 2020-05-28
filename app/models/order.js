import { computed } from "@ember/object";
import { equal, alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo, hasMany } from "ember-data/relationships";

export default Model.extend({
  store: service(),
  code: attr("string"),
  state: attr("string"),
  purposeDescription: attr("string"),
  orderType: attr("string"),
  cancellationReason: belongsTo("cancellation_reason", { async: false }),
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
  messageIds: attr(),
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

  isGoodCityOrder: equal("detailType", "GoodCity"),
  isDraft: equal("state", "draft"),
  isSubmitted: equal("state", "submitted"),
  isAwaitingDispatch: equal("state", "awaiting_dispatch"),
  isDispatching: equal("state", "dispatching"),
  isClosed: equal("state", "closed"),
  isProcessing: equal("state", "processing"),
  isCancelled: equal("state", "cancelled"),
  i18n: service(),

  isAppointment: computed("bookingType", function() {
    return this.get("bookingType.isAppointment");
  }),

  isOnlineOrder: computed("bookingType", function() {
    return this.get("bookingType.isOnlineOrder");
  }),

  // only to show ordersPackages on confirmation screen
  orderItems: computed("ordersPackages.[]", function() {
    var items = [];
    this.get("ordersPackages").forEach(function(record) {
      if (record) {
        var pkg = record.get("package");
        items.push(pkg);
      }
    });
    return items.uniq();
  }),

  isAppointmentDraft: computed("state", "orderType", function() {
    return this.get("isAppointment") && this.get("isDraft");
  }),

  isOnlineOrderDraft: computed("state", "orderType", function() {
    return this.get("isOnlineOrder") && this.get("isDraft");
  }),

  isEditAllowed: computed("state", function() {
    let editableStates = [
      "draft",
      "submitted",
      "processing",
      "restart_process",
      "awaiting_dispatch"
    ];
    return editableStates.indexOf(this.get("state")) >= 0;
  }),

  isCancelAllowed: computed("state", function() {
    let cancellableStates = [
      "submitted",
      "processing",
      "restart_process",
      "awaiting_dispatch"
    ];
    return cancellableStates.indexOf(this.get("state")) >= 0;
  }),

  clientIdType: computed("beneficiary", "beneficiary.identityType", function() {
    return this.get("beneficiary.identityType.name");
  }),

  clientIdNumber: alias("beneficiary.identityNumber"),

  clientName: alias("beneficiary.fullName"),

  clientPhone: alias("beneficiary.phoneNumber"),

  appointmentTransport: computed("orderTransport.transportType", function() {
    let i18n = this.get("i18n");
    return this.get("orderTransport.transportType") === "self"
      ? i18n.t("order.appointment.self_vehicle")
      : i18n.t("order.appointment.hire_vehicle");
  }),

  appointmentDate: computed("orderTransport.scheduledAt", function() {
    let orderTransport = this.get("orderTransport");
    if (!orderTransport) {
      return "";
    }
    return moment(orderTransport.get("scheduledAt")).format("dddd MMMM Do");
  }),

  appointmentTime: computed(
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

  stateIcon: computed("state", function() {
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

  purposeName: computed("ordersPurposes.[]", function() {
    return this.get("ordersPurposes.firstObject.purpose.description");
  }),

  transportIcon: computed("transportKey", function() {
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

  transportLabel: computed("transportKey", function() {
    const key = this.get("transportKey");
    return this.get("i18n").t(`my_orders.order_transports.${key}`);
  }),

  transportKey: computed("orderTransport.transportType", function() {
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
  unreadMessagesCount: computed("messages.@each.state", function() {
    return this.get("messages").filterBy("state", "unread").length;
  }),

  hasUnreadMessages: computed("unreadMessagesCount", function() {
    return this.get("unreadMessagesCount") > 0;
  })
});
