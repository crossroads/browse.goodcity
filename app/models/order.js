 import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({

  code: attr('string'),
  state: attr('string'),
  purposeDescription: attr('string'),
  orderType: attr('string'),
  ordersPackages: hasMany("orders_packages", { async: false }),
  orderTransportId: attr('string'),
  orderTransport: belongsTo('order_transport', { async: false }),
  address: belongsTo('address', { async: false }),
  organisation: belongsTo('organisation', { async: false }),
  createdById:      belongsTo('user', { async: false }),
  createdAt:        attr('date'),
  updatedAt:        attr('date'),
  detailType:       attr('string'),
  districtId:       attr('number'),
  ordersPurposes:     hasMany('ordersPurpose', { async: false }),
  beneficiaryId: attr('string'),
  bookingTypeId: attr('number'),
  beneficiary: belongsTo('beneficiary', { async: false }),
  peopleHelped: attr('number'),
  goodcityRequests:   hasMany('goodcity_request', { async: false }),
  district: belongsTo('district', {async: false}),
  bookingType:   belongsTo('booking_type', { async: false }),
  purposeIds: attr(),

  isGoodCityOrder: Ember.computed.equal('detailType', 'GoodCity'),
  isDraft: Ember.computed.equal("state", "draft"),
  isSubmitted: Ember.computed.equal("state", "submitted"),
  isAwaitingDispatch: Ember.computed.equal("state", "awaiting_dispatch"),
  isDispatching: Ember.computed.equal("state", "dispatching"),
  isClosed: Ember.computed.equal("state", "closed"),
  isProcessing: Ember.computed.equal("state", "processing"),
  isCancelled: Ember.computed.equal("state", "cancelled"),
  i18n: Ember.inject.service(),

  isAppointment: Ember.computed('bookingTypeId', function(){
    return this.get('bookingType.isAppointment');
  }),

  isOnlineOrder: Ember.computed('bookingTypeId', function(){
    return this.get('bookingType.isOnlineOrder');
  }),

  orderItems: Ember.computed('ordersPackages.[]', function() {
    var items = [];
    this.get('ordersPackages').forEach(function(record) {
      if(record) {
        var pkg = record.get('package');
        if (pkg && pkg.get('hasSiblingPackages')) {
          items.push(pkg.get('item'));
        } else {
          items.push(pkg);
        }
      }
    });
    return items.uniq();
  }),

  isAppointmentDraft: Ember.computed('state', 'orderType', function(){
    return this.get('isAppointment') && this.get('isDraft');
  }),

  isOnlineOrderDraft: Ember.computed('state', 'orderType', function(){
    return this.get('isOnlineOrder') && this.get('isDraft');
  }),

  isEditAllowed: Ember.computed('state', function() {
    let editableStates = ["draft", "submitted", "processing", "restart_process", "awaiting_dispatch"];
    return editableStates.indexOf(this.get("state")) >= 0;
  }),

  isCancelAllowed: Ember.computed('state', function() {
    let cancellableStates = ["submitted", "processing", "restart_process", "awaiting_dispatch"];
    return cancellableStates.indexOf(this.get("state")) >= 0;
  }),

  clientIdType: Ember.computed("beneficiary", "beneficiary.identityType", function() {
    return this.get("beneficiary.identityType.name");
  }),

  clientIdNumber: Ember.computed("beneficiary", function() {
    return this.get("beneficiary.identityNumber");
  }),

  clientName: Ember.computed("beneficiary", function() {
    return this.get("beneficiary.fullName");
  }),

  clientPhone: Ember.computed("beneficiary", function() {
    return this.get("beneficiary.phoneNumber");
  }),

  appointmentTransport: Ember.computed("orderTransport", function() {
    let i18n = this.get("i18n");
    return this.get("orderTransport.transportType") === "self" ?
      i18n.t("order.appointment.self_vehicle") : i18n.t("order.appointment.hire_vehicle");
  }),

  appointmentDate: Ember.computed("orderTransport", function() {
    let orderTransport = this.get("orderTransport");
    if (!orderTransport) {
      return '';
    }
    return moment(orderTransport.get("scheduledAt")).format('dddd MMMM Do');
  }),

  appointmentTime: Ember.computed("orderTransport", function() {
    let orderTransport = this.get("orderTransport");
    if (!orderTransport) {
      return '';
    }
    return `${this.get('appointmentDate')}, ${orderTransport.get("timeslot")}`;
  }),

  stateIcon: Ember.computed('state', function () {
    const state = this.get("state");
    switch (state) {
      case "awaiting_dispatch":
      case "scheduled":
        return "clock-o";
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
        return "pencil";
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
    const key = this.get('transportKey');
    return this.get("i18n").t(`my_orders.order_transports.${key}`);
  }),

  transportKey: Ember.computed("orderTransport.transportType", function() {
    const transportType = this.get('orderTransport.transportType');
    switch (transportType) {
      case "ggv":
        return "gogovan_transport";
      case "self":
        return "collection_transport";
      default:
        return "unknown_transport";
    }
  }),

});
