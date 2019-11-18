import $ from "jquery";
import { run } from "@ember/runloop";
import { module, test } from "qunit";
import startApp from "../helpers/start-app";
import { make, mockFindAll } from "ember-data-factory-guy";

var App,
  user,
  user1,
  organisation,
  organisationsUser,
  user_profile,
  gogo_van,
  order,
  pkg,
  ordersPackage,
  gcOrganisations,
  bookingType,
  purpose,
  role,
  userRole,
  mocks;

module("Acceptance | Cancel booking", {
  needs: ["service:subscription"],
  beforeEach: function() {
    App = startApp();
    $.mockjaxSettings.matchInRegistrationOrder = false;
    $.mockjax.clear();

    mocks = [];
    user = make("user");
    user1 = make("user");
    organisation = make("organisation");
    pkg = make("package");
    bookingType = make("booking_type");
    order = make("order", {
      state: "draft",
      created_by_id: user.id,
      booking_type_id: bookingType.get("id")
    });
    ordersPackage = make("orders_package", {
      quantity: 1,
      state: "requested",
      package: pkg,
      packageId: pkg.id,
      order: order
    });
    gogo_van = make("gogovan_transport");
    purpose = make("purpose");
    gcOrganisations = make("gc_organisation", { nameEn: "GCC club" });
    role = make("role");
    userRole = make("user_role", {
      userId: user.id,
      roleId: role.id,
      user: user,
      role: role
    });

    mocks.push(
      $.mockjax({ url: "/api/v1/requested_package*", responseText: [] }),
      $.mockjax({
        url: "/api/v1/booking_type*",
        responseText: [bookingType.toJSON({ includeId: true })]
      }),
      $.mockjax({
        url: "/api/v1/available_*",
        type: "GET",
        status: 200,
        responseText: [
          "2018-06-14",
          "2018-06-15",
          "2018-06-16",
          "2018-06-19",
          "2018-06-20",
          "2018-06-21"
        ]
      })
    );
    mockFindAll("gogovan_transport").returns({
      json: { gogovan_transports: [gogo_van.toJSON({ includeId: true })] }
    });
    mockFindAll("booking_type").returns({
      json: { booking_types: [bookingType.toJSON({ includeId: true })] }
    });
    mockFindAll("purpose").returns({
      json: { purposes: [purpose.toJSON({ includeId: true })] }
    });
    mockFindAll("order").returns({
      json: {
        orders: [order.toJSON({ includeId: true })],
        packages: [pkg.toJSON({ includeId: true })],
        booking_types: [bookingType.toJSON({ includeId: true })],
        orders_packages: [ordersPackage.toJSON({ includeId: true })]
      }
    });
    user_profile = {
      id: user.id,
      first_name: user.get("firstName"),
      last_name: user.get("lastName"),
      mobile: user.get("mobile"),
      user_role_ids: [userRole.get("id")]
    };
    organisationsUser = make("organisations_user", {
      user: user,
      organisation: organisation
    });
    mocks.push(
      $.mockjax({
        url: "/api/v1/auth/current_user_profil*",
        responseText: {
          user_profile: user_profile,
          organisations: [organisation.toJSON({ includeId: true })],
          organisations_users: [organisationsUser.toJSON({ includeId: true })]
        }
      }),
      $.mockjax({
        url: "/api/v1/organisations_use*",
        responseText: {
          users: [user_profile],
          organisations: [organisation.toJSON({ includeId: true })],
          organisations_users: [organisationsUser.toJSON({ includeId: true })]
        }
      })
    );
  },

  afterEach: function() {
    // Clear our ajax mocks
    $.mockjaxSettings.matchInRegistrationOrder = true;
    mocks.forEach($.mockjax.clear);

    run(App, App.destroy);
  }
});

test("Request purpose page redirects back to home page on clicking cancel if order doesn't exist", function(assert) {
  assert.expect(1);
  visit("/request_purpose");
  andThen(function() {
    click("#cancel-booking-link");
  });
  andThen(function() {
    assert.equal(currentURL(), "/home");
  });
});

test("Request purpose page deletes order if in draft state ", function(assert) {
  assert.expect(1);
  mocks.push(
    $.mockjax({
      url: "/api/v1/orde*",
      type: "DELETE",
      status: 200,
      responseText: {}
    })
  );
  visit(`request_purpose/?editRequest=true&orderId=${order.id}`);
  andThen(function() {
    click("#cancel-booking-link");
  });
  andThen(function() {
    click("#messageBox div div:nth-child(2) a");
  });
  andThen(function() {
    assert.equal(currentURL(), "/home");
  });
});

test("Request purpose changes order state to canceled if in any other state except draft", function(assert) {
  let submittedOrder = make("order", {
    state: "submitted",
    created_by_id: user.id
  });
  assert.expect(1);
  mocks.push(
    $.mockjax({
      url: "/api/v1/orde*",
      type: "PUT",
      status: 200,
      responseText: {}
    })
  );
  visit(`request_purpose/?editRequest=true&orderId=${submittedOrder.id}`);
  andThen(function() {
    click("#cancel-booking-link");
  });
  andThen(function() {
    fillIn($("#messageBox textarea"), "test");
    click("#messageBox div div:nth-child(2) a");
  });
  andThen(function() {
    assert.equal(currentURL(), "/home");
  });
});
