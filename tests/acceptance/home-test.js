import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
var App;

module('Acceptance | Home Page', {
  beforeEach: function() {
    App = startApp();
  },

  afterEach: function() {
    Ember.run(App, App.destroy);
  }
});

test("should redirect to home page", function(assert) {
  visit("/").then(function() {
    assert.equal(currentURL(), '/home');
  });
});

test("should link to the browse page", function(assert) {
    visit("/").then(function() {
        let links = Ember.$('.home_page a').filter((key, link) => /\/browse$/.test(link));
        assert.ok(links.length >= 1);
    });
});

test("should link to the FAQ page", function(assert) {
    visit("/").then(function() {
        let links = Ember.$('.home_page a').filter((key, link) => /\/faq$/.test(link));
        assert.ok(links.length >= 1);
    });
});
  
