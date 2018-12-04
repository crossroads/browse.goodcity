import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import {make} from 'ember-data-factory-guy';
import { mockFindAll } from 'ember-data-factory-guy';
import FactoryGuy from 'ember-data-factory-guy';

var App, pkgCategory, subcategory1, pkg, pkgType1, pkgType2, subcategory2, order, ordersPackage, gogo_van, order_purpose, user, bookingType;

module('Acceptance | Cart Page', {
  beforeEach: function() {
    window.localStorage.authToken = '"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo2LCJpYXQiOjE1MTg3NzI4MjcsImlzcyI6Ikdvb2RDaXR5SEsiLCJleHAiOjE1MTk5ODI0Mjd9.WdsVvss9khm81WNScV5r6DiIwo8CQfHM1c4ON2IACes"';
    App = startApp();
    pkgType1     = make("package_type_with_packages");
    pkgType2     = make("package_type_with_packages");
    pkgCategory  = make("parent_package_category");
    user = make("user_without_name_and_mobile");
    order = make("order", { state: "draft", created_by_id: user.id });
    pkg = make('package');
    ordersPackage = make("orders_package", { quantity: 1, state: "requested", package: pkg, packageId: pkg.id, order: order});
    order_purpose = make("orders_purpose");
    subcategory1 = make("package_category", {parentId: parseInt(pkgCategory.id), packageTypeCodes: pkgType1.get("code") });
    subcategory2 = make("package_category", {parentId: parseInt(pkgCategory.id), packageTypeCodes: pkgType2.get("code") });
    gogo_van = make("gogovan_transport");
    bookingType = make("booking_type");
    $.mockjax({url: "/api/v1/available_*", type: 'GET', status: 200, responseText:["2018-06-14", "2018-06-15", "2018-06-16", "2018-06-19", "2018-06-20", "2018-06-21"]});
    mockFindAll("gogovan_transport").returns({json: {gogovan_transports: [gogo_van.toJSON({includeId: true})]}});
    mockFindAll("booking_type").returns({json: {booking_types: [bookingType.toJSON({includeId: true})]}});

    var data = {"user_profile": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111", "user_role_ids": [1]}], "users": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111"}], "roles": [{"id": 4, "name": "Supervisor"}], "user_roles": [{"id": 1, "user_id": 2, "role_id": 4}]};
    $.mockjax({url:"/api/v1/auth/current_user_profil*",
      responseText: data });

    mockFindAll('order').returns({ json: {orders: [order.toJSON({includeId: true})], packages: [pkg.toJSON({includeId: true})], orders_packages: [ordersPackage.toJSON({includeId: true})]}});
  },

  afterEach: function() {
    Ember.run(App, App.destroy);
  }
});


test("delete orders_packages from orders in draft", function(assert){
  var store = FactoryGuy.store;
  $.mockjax({url:"/api/v1/order*", type: 'POST', status: 200,responseText:{"order": order.toJSON({includeId: true}),"package": pkg.toJSON({includeId: true}), "orders_packages": [ordersPackage.toJSON({includeId: true})], "orders_purposes": [order_purpose.toJSON({includeId: true})]}});
  $.mockjax({url:"/api/v1/order*", type: 'PUT', status: 200,responseText:{"order": order.toJSON({includeId: true}),"package": pkg.toJSON({includeId: true}), "orders_packages": [ordersPackage.toJSON({includeId: true})], "orders_purposes": [order_purpose.toJSON({includeId: true})]}});
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
                  assert.equal(store.peekAll("orders_package").get("length"), 0);
                });
              });
            });
          });
        });
      });
    });

  });
});

test("restricting transport details page to confirm page without userName and mobile", function(assert){
  mockFindAll('order').returns({ json: {orders: [order.toJSON({includeId: true})], packages: [pkg.toJSON({includeId: true})], user: [user.toJSON({includeId: true})], orders_packages: [ordersPackage.toJSON({includeId: true})]}});
  assert.expect(4);
  visit('/order/'+ order.id + '/transport_details');
  andThen(function(){
    assert.equal(currentURL(), '/order/'+ order.id +'/transport_details');
    click('#ggv');
    andThen(function(){
      assert.equal($('#name')[0].value, user.get('firstName')+" "+user.get('lastName'));
      assert.equal($('#mobile')[0].value, user.get('mobile'));
      click('#submit_pin');
      andThen(function(){
        assert.equal(currentURL(), '/order/'+ order.id +'/transport_details');
      });
    });
  });
});

