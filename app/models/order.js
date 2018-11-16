import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({

  code: attr('string'),
  state: attr('string'),
  purposeDescription: attr('string'),
  ordersPackages: hasMany("orders_packages", { async: false }),
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

  isGoodCityOrder: Ember.computed.equal('detailType', 'GoodCity'),
  isDraft: Ember.computed.equal("state", "draft"),
  isSubmitted: Ember.computed.equal("state", "submitted"),
  isAwaitingDispatch: Ember.computed.equal("state", "awaiting_dispatch"),
  isDispatching: Ember.computed.equal("state", "dispatching"),
  isClosed: Ember.computed.equal("state", "closed"),
  isProcessing: Ember.computed.equal("state", "processing"),
  isCancelled: Ember.computed.equal("state", "cancelled"),

  updatedState: Ember.computed('state', function() {
    return this.get("state");
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
  })

});
