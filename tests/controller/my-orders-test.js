import { test, moduleFor } from 'ember-qunit';
import startApp from '../helpers/start-app';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import Ember from 'ember';

var App, designation;

moduleFor('controller:my_orders', 'my_orders controller', {
  beforeEach: function() {
    App = startApp({}, 2);
    TestHelper.setup();
    designation = FactoryGuy.make("designation");
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

test('calling setOrder action sets order ', function(assert) {
  assert.expect(2);

  // get the controller instance
  var ctrl = this.subject();

  assert.equal(ctrl.get('selectedOrder'), null);

  ctrl.send('setOrder', designation);

  assert.equal(ctrl.get('selectedOrder'), designation);
});

