import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import {make} from 'ember-data-factory-guy';
import { mockFindAll } from 'ember-data-factory-guy';
import FactoryGuy from 'ember-data-factory-guy';

var App, pkgCategory, subcategory1, pkg, pkgType1, pkgType2, subcategory2, order, ordersPackage, ordersPackage1, gogo_van, order_purpose;

module('Acceptance | Cart Page', {
  beforeEach: function() {
    window.localStorage.authToken = '"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo2LCJpYXQiOjE1MTg3NzI4MjcsImlzcyI6Ikdvb2RDaXR5SEsiLCJleHAiOjE1MTk5ODI0Mjd9.WdsVvss9khm81WNScV5r6DiIwo8CQfHM1c4ON2IACes"';
    App = startApp();
    pkgType1     = make("package_type_with_packages");
    pkgType2     = make("package_type_with_packages");
    pkgCategory  = make("parent_package_category");
    order = make("order", { state: "draft" });
    pkg = make('package');
    ordersPackage = make("orders_package", { quantity: 1, state: "requested", package: pkg, order: order});
    ordersPackage1 = make("orders_package", { quantity: 1, state: "requested", package: pkg, order: order});
    order_purpose = make("orders_purpose");
    subcategory1 = make("package_category", {parentId: parseInt(pkgCategory.id), packageTypeCodes: pkgType1.get("code") });
    subcategory2 = make("package_category", {parentId: parseInt(pkgCategory.id), packageTypeCodes: pkgType2.get("code") });
    gogo_van = make("gogovan_transport");

    mockFindAll("gogovan_transport").returns({json: {gogovan_transports: [gogo_van.toJSON({includeId: true})]}});

    var data = {"user_profile": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111", "user_role_ids": [1]}], "users": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111"}], "roles": [{"id": 4, "name": "Supervisor"}], "user_roles": [{"id": 1, "user_id": 2, "role_id": 4}]};
    $.mockjax({url:"/api/v1/auth/current_user_profil*",
      responseText: data });

    mockFindAll('order').returns({ json: {orders: [order.toJSON({includeId: true})], packages: [pkg.toJSON({includeId: true})], orders_packages: [ordersPackage.toJSON({includeId: true}), ordersPackage1.toJSON({includeId: true})]}});
  },

  afterEach: function() {
    Ember.run(App, App.destroy);
  }
});


test("delete orders_packages from orders in draft", function(assert){
  var store = FactoryGuy.store;
  $.mockjax({url:"/api/v1/order*", type: 'POST', status: 200,responseText:{"order": order.toJSON({includeId: true}),"package": pkg.toJSON({includeId: true}), "orders_packages": [ordersPackage.toJSON({includeId: true}), ordersPackage1.toJSON({includeId: true})], "orders_purposes": [order_purpose.toJSON({includeId: true})]}});
  $.mockjax({url:"/api/v1/order*", type: 'PUT', status: 200,responseText:{"order": order.toJSON({includeId: true}),"package": pkg.toJSON({includeId: true}), "orders_packages": [ordersPackage.toJSON({includeId: true}), ordersPackage1.toJSON({includeId: true})], "orders_purposes": [order_purpose.toJSON({includeId: true})]}});
  $.mockjax({url: "/api/v1/available_*", type: 'GET', status: 200, responseText:["2018-06-14", "2018-06-15", "2018-06-16", "2018-06-19", "2018-06-20", "2018-06-21"]});
  $.mockjax({url: "/api/v1/orders_pac*", type: 'DELETE', status: 200, responseText:{ }});

  visit("/item/"+ pkg.id +"?categoryId="+ pkgCategory.id +"&sortBy=createdAt");
  andThen(function() {
    assert.equal(currentURL(), "/item/"+ pkg.id +"?categoryId="+ pkgCategory.id +"&sortBy=createdAt");
    $(".request-item").click();
    andThen(function(){
      visit("/cart");
      andThen(function(){
        click(".expand:last");
        andThen(function(){
          assert.equal(currentURL(), "/order_details");

          click('input#1');
          andThen(function(){
            $("#purpose_1").prop('checked', true);
            $("#description").val("Test");
            click("#submit_pin");
            andThen(function(){
              visit("/cart");
              andThen(function(){
                assert.equal(currentURL(),"/cart");
                click(".item-collection li:first span");
                andThen(function(){
                  assert.equal(store.peekAll("orders_package").get("length"), 1);
                });
              });
            });
          });
        });
      });
    });

  });
});
