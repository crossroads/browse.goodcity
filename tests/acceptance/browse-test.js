import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import {make} from 'ember-data-factory-guy';

var App, pkgCategory1, pkgCategory2, subcategory1, pkgType, category_title, subcategory_title, empty_category_title;

module('Acceptance | Browse Page', {
  beforeEach: function() {
    App = startApp();
    pkgType      = make("package_type_with_packages");
    pkgCategory1 = make("parent_package_category");
    subcategory1 = make("package_category", {parentId: parseInt(pkgCategory1.id), packageTypeCodes: pkgType.get("code") });
    pkgCategory2 = make("parent_package_category");

    category_title = pkgCategory1.get('name') + " ("+ pkgCategory1.get("items.length") +")";
    subcategory_title = subcategory1.get('name') + " ("+ subcategory1.get("items.length") +")";
    empty_category_title = pkgCategory2.get('name') + " ("+ pkgCategory2.get("items.length") +")";
  },

  afterEach: function() {
    Ember.run(App, App.destroy);
  }
});

test("should redirect browse page", function(assert) {
  visit("/").then(function() {
    assert.equal(currentURL(), '/browse');
    assert.equal(Ember.$('h1.title').text(), "Browse Goods");
    assert.equal(Ember.$('.main-section li').length, 0);
  });
});

test("should list main-category with subcategories if has items", function(assert) {
  visit("/").then(function() {
    // check first group of main-category
    assert.equal(Ember.$('.main-section li:first .main_category').text().indexOf(category_title) <= 0, true);
    assert.equal(Ember.$('.main-section li:first .subcategories').text().indexOf(subcategory_title) >= 0, false);
  });
});

test("should list main-category without subcategories if has no items", function(assert) {
  visit("/");

  andThen(function() {
    // check last group of main-category with no-items
    assert.equal(Ember.$('.main-section li:last .main_category').text().indexOf(empty_category_title) <= 0, true);
    assert.equal(Ember.$.trim(Ember.$('.main-section li:last .subcategories').text()), "");
  });
});

