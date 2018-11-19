import { test, moduleFor } from 'ember-qunit';
import startApp from '../helpers/start-app';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import Ember from 'ember';
import FactoryGuy from 'ember-data-factory-guy';
import '../factories/order';

var App, order;

moduleFor('controller:my_orders', 'my_orders controller', {
  beforeEach: function() {
    App = startApp({}, 2);
    TestHelper.setup();
    order = FactoryGuy.make("order");
  },
  afterEach: function() {
    Ember.run(function() { TestHelper.teardown(); });
    Ember.run(App, 'destroy');
  }
});

test('Checking for default set values', function(assert) {
  assert.expect(2);

  // get the controller instance
  var ctrl = this.subject();

  assert.equal(ctrl.get('sortProperties')[0], "createdAt:desc");
  assert.equal(ctrl.get('selectedOrder'), null);
});