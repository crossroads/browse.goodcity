import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({

  code: attr('string'),
  state: attr('string'),
  purposeDescription: attr('string'),
  ordersPackages: hasMany("orders_packages", { async: false }),
  orderTransportId: attr('string'),
  orderTransport: belongsTo('order_transport', { async: false }),
  address: belongsTo('address', { async: false }),
  organisation: belongsTo('organisation', { async: false }),
  createdById:      belongsTo('user', { async: false }),
  beneficiary:   belongsTo('beneficiary', { async: false }),
  createdAt:        attr('date'),
  updatedAt:        attr('date'),
  detailType:       attr('string'),
  ordersPurposes:     hasMany('ordersPurpose', { async: false }),
  goodcityRequests:   hasMany('goodcityRequest', { async: false }),
  beneficiaryId: attr('number'),
  beneficiary: belongsTo('beneficiary', { async: false }),
  peopleHelped: attr('number'),
  goodcityRequests:   hasMany('goodcity_request', { async: false }),

  isGoodCityOrder: Ember.computed.equal('detailType', 'GoodCity'),
  isDraft: Ember.computed.equal("state", "draft"),
  isSubmitted: Ember.computed.equal("state", "submitted"),
  isAwaitingDispatch: Ember.computed.equal("state", "awaiting_dispatch"),
  isDispatching: Ember.computed.equal("state", "dispatching"),
  isClosed: Ember.computed.equal("state", "closed"),
  isProcessing: Ember.computed.equal("state", "processing"),
  isCancelled: Ember.computed.equal("state", "cancelled"),

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
