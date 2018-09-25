import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import {make} from 'ember-data-factory-guy';
import { mockFindAll } from 'ember-data-factory-guy';

var App, user, organisation, organisationsUser, gogo_van, order, pkg, ordersPackage, gcOrganisations;

module('Acceptance | Account Details Page', {
  beforeEach: function() {
    window.localStorage.authToken = '"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo2LCJpYXQiOjE1MTg3NzI4MjcsImlzcyI6Ikdvb2RDaXR5SEsiLCJleHAiOjE1MTk5ODI0Mjd9.WdsVvss9khm81WNScV5r6DiIwo8CQfHM1c4ON2IACes"';
    App = startApp();
    user = make("user");
    organisation = make("organisation");
    organisationsUser = make("organisations_user", {user_id: user.id, organisation_id: organisation.id});
    pkg = make('package');
    ordersPackage = make("orders_package", { quantity: 1, state: "requested", package: pkg, packageId: pkg.id, order: order});
    order = make("order", { state: "draft", created_by_id: user.id });
    gogo_van = make("gogovan_transport");
    gcOrganisations = make("gc_organisation", {nameEn: "GCC club"});

    $.mockjax({url: "/api/v1/available_*", type: 'GET', status: 200, responseText:["2018-06-14", "2018-06-15", "2018-06-16", "2018-06-19", "2018-06-20", "2018-06-21"]});
    mockFindAll("gogovan_transport").returns({json: {gogovan_transports: [gogo_van.toJSON({includeId: true})]}});

    var user_profile = {"id": user.id,"first_name": user.get('firstName'), "last_name": user.get('lastName'), "mobile": user.get('mobile'), "user_role_ids": [1] };
    $.mockjax({url:"/api/v1/auth/current_user_profil*",
      responseText: {
        user_profile: user_profile,
        organisations: [organisation.toJSON({includeId: true})],
        organisations_users: [organisationsUser.toJSON({includeId: true})]
      }});

    $.mockjax({url: "api/v1/gc_org*", type: 'GET', responseText: {
       meta :{ total_pages:1, search: "club"},
       gc_organisations: [gcOrganisations.toJSON({includeId: true}), organisation.toJSON({includeId: true})],
       organisations: [gcOrganisations.toJSON({includeId: true}), organisation.toJSON({includeId: true})],
    }});
    mockFindAll('order').returns({ json: {orders: [order.toJSON({includeId: true})], packages: [pkg.toJSON({includeId: true})], orders_packages: [ordersPackage.toJSON({includeId: true})]}});

    $.mockjax({url:"/api/v1/org*", type: 'POST', status: 200,responseText:{
        users: [user.toJSON({ includeId: true })],
        organisations: [organisation.toJSON({includeId: true})],
        organisations_users: [organisationsUser.toJSON({includeId: true})]
      }
    });
  },

  afterEach: function() {
    Ember.run(App, App.destroy);
  }
});

test("Clicking organisations from search organisation page fills organisatin details on account_details page", function(assert){
  assert.expect(6);
  visit('/account_details');
  andThen(function(){
    assert.equal(currentURL(), '/account_details');
    assert.equal($("#firstName").val(), user.get('firstName'));
    assert.equal($("#lastName").val(), user.get('lastName'));
    assert.equal($("#email").val(), user.get('email'));
    assert.equal($("#organisation_details").val(), organisation.get('nameEn'));
    assert.equal($("#position").val(), organisationsUser.get('position'));
  });
});

test("After saving user details user gets redirected to browse page", function(assert) {
  visit('/account_details');
  andThen(function(){
    click(".expand_button");
  });
  andThen(function() {
    assert.equal(currentURL(), "/browse");
  });
});

test("User redirects to search_organisation page on clicking Organisation Name Input", function(assert){
  assert.expect(2);
  visit('/account_details');
  andThen(function(){
    assert.equal(currentURL(), '/account_details');
    click('#organisation_details');
    andThen(function(){
      assert.equal(currentURL(), '/search_organisation');
    });
  });
});
