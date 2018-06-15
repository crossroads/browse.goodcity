import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import {make} from 'ember-data-factory-guy';
import { mockFindAll } from 'ember-data-factory-guy';

var App, order, pkg, ordersPacakge;

module('Acceptance | Cancel Order', {
  beforeEach: function() {
    window.localStorage.authToken = '"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo2LCJpYXQiOjE1MTg3NzI4MjcsImlzcyI6Ikdvb2RDaXR5SEsiLCJleHAiOjE1MTk5ODI0Mjd9.WdsVvss9khm81WNScV5r6DiIwo8CQfHM1c4ON2IACes"';
    App = startApp();
    order = make("order", { state: "draft" });
    pkg = make("package");
    ordersPacakge = make("orders_package", { quantity: 1, package: pkg, order: order, state: "requested" });
    var data = {"user_profile": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111", "user_role_ids": [1]}], "users": [{"id": 2,"first_name": "David", "last_name": "Dara51", "mobile": "61111111"}], "roles": [{"id": 4, "name": "Supervisor"}], "user_roles": [{"id": 1, "user_id": 2, "role_id": 4}]};
    var availableDates = ["2018-06-13","2018-06-14","2018-06-15","2018-06-16"];

    mockFindAll('order').returns({ json: {orders: [order.toJSON({includeId: true})], packages: [pkg.toJSON({includeId: true})], orders_packages: [ordersPacakge.toJSON({includeId: true})]}});
    $.mockjax({ url: "/api/v1/available_date*", type: 'GET', status: 200,
      responseText: availableDates
     });
    $.mockjax({ url: "/api/v1/auth/current_user_profil*",
      responseText: data });
    visit("/");
  },

  afterEach: function() {
    Ember.run(App, App.destroy);
  }
});

test("Clicking cancel order on transport detail page deletes the order", function(assert) {
  assert.expect(1);
  visit("/order/" + order.id +"/transport_details");

  andThen(function() {
    assert.equal(currentURL(), "/order/" + order.id +"/transport_details");
    click($('.cancel_order a'));
    andThen(function() {
      //clicking on cancel order button of messageBox
      click($("#messageBox #btn1"));
      andThen(function() {
        console.log("order deleted");
      });
    });
  });
});

test("Clicking cancel order on confirm page deletes the order", function(assert) {
  assert.expect(1);
  visit("/order/" + order.id +"/confirm");

  andThen(function() {
    assert.equal(currentURL(), "/order/" + order.id +"/confirm");
    click($('.cancel_order a'));
    andThen(function() {
      //clicking on cancel order button of messageBox
      click($("#messageBox #btn1"));
      andThen(function() {
        console.log("order deleted");
      });
    });
  });
});
