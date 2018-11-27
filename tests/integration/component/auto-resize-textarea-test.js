import { test, moduleForComponent } from 'ember-qunit';
import startApp from '../../helpers/start-app';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

var App;

moduleForComponent('auto-resize-textarea', 'Integration | Component | auto resize textarea', {
  integration: true,
  beforeEach: function() {
    App = startApp({}, 2);
    TestHelper.setup();
    this.render(hbs`{{auto-resize-textarea id="description"}}`);
  },
  afterEach: function() {
    Ember.run(function() { TestHelper.teardown(); });
    Ember.run(App, 'destroy');
  }
});

test('is an textarea tag', function(assert) {
  assert.expect(1);
  assert.equal($('#description').prop('tagName'), 'TEXTAREA');
});

test('is of textarea type', function(assert) {
  assert.expect(1);
  assert.equal($('#description')[0].type, "textarea");
});

test('initial height is 68px', function(assert) {
  assert.expect(1);
  assert.equal($('#description').css('height'), "68px");
});

