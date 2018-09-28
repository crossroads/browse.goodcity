import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import { make, mockFindAll } from 'ember-data-factory-guy';

var App, pkg, organisationsUser, ordersPackage, order, organisation, user, gogo_van;

module('Acceptance: Login', {
  beforeEach: function() {
    App = startApp({}, 2);
    user = make("user");
    organisation = make("organisation");
    organisationsUser = make("organisations_user", {user: user, organisation: organisation});
    pkg = make('package');
    ordersPackage = make("orders_package", { quantity: 1, state: "requested", package: pkg, packageId: pkg.id, order: order});
    order = make("order", { state: "draft", created_by_id: user.id });
    gogo_van = make("gogovan_transport");

    var user_profile = {"id": user.id,"first_name": user.get('firstName'), "last_name": user.get('lastName'), "mobile": user.get('mobile'), "user_role_ids": [1] };

    $.mockjax({url:"/api/v1/auth/current_user_profil*",
      responseText: {
        user_profile: user_profile,
        organisations: [organisation.toJSON({includeId: true})],
        organisations_users: [organisationsUser.toJSON({includeId: true})]
      }});
    $.mockjax({url: "/api/v1/available_*", type: 'GET', status: 200, responseText:["2018-06-14", "2018-06-15", "2018-06-16", "2018-06-19", "2018-06-20", "2018-06-21"]});
    mockFindAll("gogovan_transport").returns({json: {gogovan_transports: [gogo_van.toJSON({includeId: true})]}});

    mockFindAll('order').returns({ json: {orders: [order.toJSON({includeId: true})], packages: [pkg.toJSON({includeId: true})], orders_packages: [ordersPackage.toJSON({includeId: true})]}});

    $.mockjax({url:"/api/v1/org*", type: 'POST', status: 200,responseText:{
        users: [user.toJSON({ includeId: true })],
        organisations: [organisation.toJSON({includeId: true})],
        organisations_users: [organisationsUser.toJSON({includeId: true})]
      }
    });

    $.mockjax({url:"/api/v1/auth/send_pi*",responseText:{
    "otp_auth_key" : "/JqONEgEjrZefDV3ZIQsNA=="
  }});

  $.mockjax({url:"/api/v1/auth/verif*",responseText:{
    "jwt_token" : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo3LCJpYXQiOjE1MjU5MjQ0NzYsImlzcyI6Ikdvb2RDaXR5SEsiLCJleHAiOjEzNTI1OTI0NDc2fQ.lO6AdJtFrhOI9VaGRR55Wq-YWmeNoLagZthsIW39b2k"
  }});

  $.mockjax({url:"/api/v1/order*", type: 'PUT', status: 200,responseText:{"order": order.toJSON({includeId: true}),"package": pkg.toJSON({includeId: true}), "orders_packages": [ordersPackage.toJSON({includeId: true})]}});

    window.localStorage.removeItem('authToken');

  },
  afterEach: function() {
    $.mockjax.clear();
    Ember.run(App, 'destroy');
  }
});

test("User able to enter mobile number and get the sms code", function(assert) {
  assert.expect(1);
  $.mockjax({url:"/api/v1/auth/send_pi*",responseText:{
    "otp_auth_key" : "/JqONEgEjrZefDV3ZIQsNA=="
  }});
  visit('/login');
  fillIn('#mobile', "61111111");
  triggerEvent('#mobile', 'blur');
  click("#getsmscode");

  andThen(function() {
    assert.equal(currentURL(), "/authenticate");
  });
});

test("User is able to resend the sms code, submit pin and logout", function(assert) {
  assert.expect(4);

  $.mockjax({url:"/api/v1/auth/send_pi*",responseText:{
    "otp_auth_key" : "/JqONEgEjrZefDV3ZIQsNA=="
  }});

  visit('/authenticate');

  andThen(function() {
    click("#resend-pin");
  });

  andThen(function() {
    assert.equal(window.localStorage.otpAuthKey, '"/JqONEgEjrZefDV3ZIQsNA=="');
  });

  $.mockjax({url:"/api/v1/auth/verif*",responseText:{
    "jwt_token" : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo3LCJpYXQiOjE1MjU5MjQ0NzYsImlzcyI6Ikdvb2RDaXR5SEsiLCJleHAiOjEzNTI1OTI0NDc2fQ.lO6AdJtFrhOI9VaGRR55Wq-YWmeNoLagZthsIW39b2k"
  }});

  var authToken = '"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo2LCJpYXQiOjE1MTg3NzI4MjcsImlzcyI6Ikdvb2RDaXR5SEsiLCJleHAiOjE1MTk5ODI0Mjd9.WdsVvss9khm81WNScV5r6DiIwo8CQfHM1c4ON2IACes"';

  andThen(function() {
    fillIn('#pin', "1234");
    triggerEvent('#pin', 'blur');
  });


  andThen(function() {
    assert.equal(find('#pin').val().length, 4);
    window.localStorage.authToken = authToken;
  });

  andThen(function() {
    visit("/");
  });

  andThen(function() {
    click("a:contains('Logout')");
  });

  andThen(function() {
    assert.equal(currentURL(), "/browse");
  });

  andThen(function() {
    assert.equal(typeof window.localStorage.authToken, "undefined");
  });

});


test("User redirected to browse page after login if account_details is complete", function(assert){
  var authToken = window.localStorage.authToken;
  visit('/login');
  fillIn('#mobile', "61111111");
  triggerEvent('#mobile', 'blur');
  click("#getsmscode");

  andThen(function() {
    assert.equal(currentURL(), "/authenticate");
    fillIn('#pin', "1234");
    triggerEvent('#pin', 'blur');
  });

  andThen(function(){
    window.localStorage.authToken = authToken;
    click("#submit_pin");
  });

  andThen(function(){
    assert.equal(currentURL(), "/browse");
  });
});

