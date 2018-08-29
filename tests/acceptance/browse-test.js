import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import {make} from 'ember-data-factory-guy';
import { mockFindAll } from 'ember-data-factory-guy';
import FactoryGuy from 'ember-data-factory-guy';

var App, pkgCategory1, pkgCategory2, subcategory1, pkgType, category_title, subcategory_title, empty_category_title, order, orders_package, gogo_van;

module('Acceptance | Browse Page', {
  beforeEach: function() {
    App = startApp();
    pkgType      = make("package_type_with_packages");
    pkgCategory1 = make("parent_package_category");
    subcategory1 = make("package_category", {parentId: parseInt(pkgCategory1.id), packageTypeCodes: pkgType.get("code") });
    pkgCategory2 = make("parent_package_category");
    order = make("order");
    orders_package = make("orders_package");
    gogo_van = make("gogovan_transport");

    mockFindAll("gogovan_transport").returns({json: {gogovan_transports: [gogo_van.toJSON({includeId: true})]}});

    var data = {"user_profile": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111", "user_role_ids": [1]}], "users": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111"}], "roles": [{"id": 4, "name": "Supervisor"}], "user_roles": [{"id": 1, "user_id": 2, "role_id": 4}]};
    $.mockjax({url:"/api/v1/auth/current_user_profil*",
      responseText: data });

    mockFindAll("order").returns({
      json:
        {orders: [order.toJSON({includeId: true})],
        orders_packages: [orders_package.toJSON({includeId: true})]}
      });

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

test("clear orders and orders_packages from ember data on logout", function(assert){
  var store = FactoryGuy.store;
  visit("/").then(function() {
    assert.equal(currentURL(), '/browse');
    click(".left-off-canvas-menu li:nth-child(4) a");
    andThen(function(){
      assert.equal(currentURL(), "/browse");
      //assert.equal(store.peekAll("order").get("length"), 0); //This has been commented due to problem in ember-data 2.13 unloadAll method. https://github.com/emberjs/data/issues/4795
      assert.equal(store.peekAll("orders_package").get("length"), 0);
    });
  });
});
