import $ from "jquery";
import { run } from "@ember/runloop";
import { module, test } from "qunit";
import { make } from "ember-data-factory-guy";
import { mockFindAll } from "ember-data-factory-guy";
import startApp from "../helpers/start-app";

var App, bookingType, mocks;

module("Acceptance | Home Page", {
  needs: ["service:subscription"],
  beforeEach: function() {
    App = startApp();
    mocks = [];
    mocks.push(
      $.mockjax({
        url: "/api/v1/requested_package*",
        type: "GET",
        responseText: []
      })
    );
    window.localStorage.authToken = "";
    bookingType = make("booking_type");
    mockFindAll("booking_type").returns({
      json: { booking_types: [bookingType.toJSON({ includeId: true })] }
    });
  },

  afterEach: function() {
    // Clear our ajax mocks
    $.mockjaxSettings.matchInRegistrationOrder = true;
    mocks.forEach($.mockjax.clear);

    run(App, App.destroy);
  }
});

test("should redirect to home page", function(assert) {
  visit("/").then(function() {
    assert.equal(currentURL(), "/home");
  });
});

test("should link to the browse page", function(assert) {
  visit("/").then(function() {
    let links = $(".home_page a").filter((key, link) => /\/browse$/.test(link));
    assert.ok(links.length >= 1);
  });
});

test("should link to the FAQ page", function(assert) {
  visit("/").then(function() {
    let links = $(".home_page a").filter((key, link) => /\/faq$/.test(link));
    assert.ok(links.length >= 1);
  });
});
