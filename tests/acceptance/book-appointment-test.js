import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'browse/tests/helpers/start-app';
import { make, mockFindAll } from 'ember-data-factory-guy';

var App, order, gogo_van, user, user_profile, orderPurpose1, orderPurpose2 , organisation, pkg, ordersPackage, mocks, goodcityRequest, benificiary, identity_types;

module('Acceptance | BookAppointment', {
  beforeEach: function() {
    App = startApp();
    user = make("user");
    organisation = make("organisation");
    pkg = make('package');
    ordersPackage = make("orders_package", { quantity: 1, state: "requested", package: pkg,
      packageId: pkg.id, order: order});
    order = make("order", { state: "draft", created_by_id: user.id, organisation_id: organisation.id,
      purpose_description: 'test test test', people_helped: "2" });
    gogo_van = make("gogovan_transport");
    user_profile = {"id": user.id,"first_name": user.get('firstName'), "last_name": user.get('lastName'),
    "mobile": user.get('mobile'), "user_role_ids": [1] };
    goodcityRequest = {id: 1, quantity: 1, description: null, code_id: null,
      order_id: order.id, package_type_id: null};
    benificiary = {created_by_id: user.id, first_name: "Test" ,id: 44, identity_number: "1233",identity_type_id: 1 , last_name: "John", phone_number: "+85212312312", title: null};
    identity_types = [{id: 2, name: "Asylum Seeker Recognizance Form"}];
    mocks = [];
    $.mockjaxSettings.matchInRegistrationOrder = false;
    mocks.push(
      $.mockjax({url:`/api/v1/orders/*`,
        type:'GET', status:200,
        responseText: {
          order: order.toJSON({includeId: true}),
          goodcity_requests: [goodcityRequest]
        }
      }),
      $.mockjax({url: "/api/v1/goodcity_request*", type: 'POST', status: 201,
        responseText: {goodcity_request: goodcityRequest}}),
      $.mockjax({url:"/api/v1/auth/current_user_profil*", responseText: user_profile }),
      $.mockjax({url: "/api/v1/available_*", type: 'GET', status: 200,
        responseText:["2018-06-14", "2018-06-15", "2018-06-16", "2018-06-19", "2018-06-20", "2018-06-21"]}),
      mockFindAll("gogovan_transport").returns({json: {gogovan_transports: [gogo_van.toJSON({includeId: true})]}}),
      mockFindAll('order').returns({ json: {orders: [order.toJSON({includeId: true})],
        packages: [pkg.toJSON({includeId: true})], orders_packages: [ordersPackage.toJSON({includeId: true})]}})
    );
  },

  afterEach: function() {
     // Clear our ajax mocks
    $.mockjaxSettings.matchInRegistrationOrder = true;
    mocks.forEach($.mockjax.clear);

    // Stop the app
    Ember.run(App, 'destroy');
  }
});

test("should redirect to login page if user not logged in", function(assert) {
  window.localStorage.removeItem('authToken');
  assert.expect(2);
  visit('/');
  andThen(function() {
    click(".book-appointment");
  });
  andThen(function(){
    assert.equal(currentURL(), '/login?bookAppointment=true');
    assert.equal(Ember.$('.title').text().trim(), "Log in/Register");
  });
});

test("request purpose page on completely filled should redirect to Goods details if For organisation's own programs is selected", function(assert){
  orderPurpose1 = {id: 1, purpose_id: 1, order_id: order.id, designation_id: 1};
  assert.expect(1);
  visit('/request_purpose');
  andThen(function(){
    click(".for-organisation");
  });
  andThen(function(){
    click("#people-count");
  });
  andThen(function(){
    fillIn("#people-count", "2");
  });
  andThen(function(){
    fillIn("#description", "test test test");
  });
  andThen(function(){
    mocks.push(
      $.mockjax({url: '/api/v1/order*', type: 'POST', status: 201,responseText: {
        order: order.toJSON({includeId: true}),
        orders_purposes: [orderPurpose1],
        user: user.toJSON({includeId: true})}
      })
    );
    click('.button.expand');
    andThen(function(){
      assert.equal(Ember.$('.title').text().trim(), "Goods Details");
    });
  });
});

test("request purpose page should not redirect if incomplete form", function(assert){
  assert.expect(1);
  visit('/request_purpose');
  andThen(function(){
    click(".for-organisation");
  });
  andThen(function(){
    click('.button.expand');
    andThen(function(){
      assert.equal(Ember.$('.title').text().trim(), "Request Purpose");
    });
  });
});

test("should redirect to Request purpose page if user is logged in", function(assert) {
  assert.expect(2);
  visit('/');
  andThen(function() {
    click(".book-appointment");
  });
  andThen(function(){
    assert.equal(currentURL(), '/request_purpose');
    assert.equal(Ember.$('.title').text().trim(), "Request Purpose");
  });
});

test("request purpose page on completely filled should redirect to client information if For client benificiary is selected", function(assert){
  orderPurpose2 = {id: 1, purpose_id: 2, order_id: order.id, designation_id: 1};
  assert.expect(1);
  visit('/request_purpose');
  andThen(function(){
    click(".for-client");
  });
  andThen(function(){
    click("#people-count");
  });
  andThen(function(){
    fillIn("#people-count", "2");
  });
  andThen(function(){
    fillIn("#description", "test test test");
  });
  andThen(function(){
    mocks.push(
      $.mockjax({url: '/api/v1/order*', type: 'POST', status: 201,responseText: {
        order: order.toJSON({includeId: true}),
        orders_purposes: [orderPurpose2],
        user: user.toJSON({includeId: true})}
      })
    );
    click('.button.expand');
    andThen(function(){
      assert.equal(Ember.$('.title').text().trim(), "Client Information");
    });
  });
});

test("Select HkID on client info should display form for hkid", function(assert){
  orderPurpose2 = {id: 1, purpose_id: 2, order_id: order.id, designation_id: 1};
  assert.expect(2);
  mocks.push(
    $.mockjax({url: '/api/v1/order*', type: 'POST', status: 201,responseText: {
      order: order.toJSON({includeId: true}),
      orders_purposes: [orderPurpose2],
      user: user.toJSON({includeId: true})}
    })
  );
  let client_info_url = `/order/${order.id}/client_information`;
  visit(client_info_url);
  andThen(function(){
    assert.equal(currentURL(), client_info_url);
  });
  andThen(function(){
    click('.hkId');
    andThen(function(){
      assert.equal(Ember.$('#id-initials').text().trim(), "P12");
    });
  });
});

test("Select RBCL on client info should display form for rbcl", function(assert){
  orderPurpose2 = {id: 1, purpose_id: 2, order_id: order.id, designation_id: 1};
  assert.expect(2);
  mocks.push(
    $.mockjax({url: '/api/v1/order*', type: 'POST', status: 201,responseText: {
      order: order.toJSON({includeId: true}),
      orders_purposes: [orderPurpose2],
      user: user.toJSON({includeId: true})}
    })
  );
  let client_info_url = `/order/${order.id}/client_information`;
  visit(client_info_url);
  andThen(function(){
    assert.equal(currentURL(), client_info_url);
  });
  andThen(function(){
    click('.abcl');
    andThen(function(){
      assert.equal(Ember.$('#id-initials').text().trim(), "RBCL");
    });
  });
});
