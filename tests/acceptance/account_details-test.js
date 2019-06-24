import Ember from "ember";
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
  userRole;

module("Acceptance | Account Details Page", {
  needs: ["service:subscription"],
  beforeEach: function() {
    App = startApp();
    user = make("user");
    user1 = make("user");
    organisation = make("organisation");
    pkg = make("package");
    ordersPackage = make("orders_package", {
      quantity: 1,
      state: "requested",
      package: pkg,
      packageId: pkg.id,
      order: order
    });
    order = make("order", {
      state: "draft",
      created_by_id: user.id
    });
    gogo_van = make("gogovan_transport");
    bookingType = make("booking_type");
    purpose = make("purpose");
    gcOrganisations = make("gc_organisation", {
      nameEn: "GCC club"
    });
    role = make("role");
    userRole = make("user_role", {
      userId: user.id,
      roleId: role.id,
      user: user,
      role: role
    });

    $.mockjax({
      url: "/api/v1/cart_item*",
      responseText: []
    });

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
    });
    mockFindAll("gogovan_transport").returns({
      json: {
        gogovan_transports: [
          gogo_van.toJSON({
            includeId: true
          })
        ]
      }
    });
    mockFindAll("booking_type").returns({
      json: {
        booking_types: [
          bookingType.toJSON({
            includeId: true
          })
        ]
      }
    });
    mockFindAll("purpose").returns({
      json: {
        purposes: [
          purpose.toJSON({
            includeId: true
          })
        ]
      }
    });
    mockFindAll("order").returns({
      json: {
        orders: [
          order.toJSON({
            includeId: true
          })
        ],
        packages: [
          pkg.toJSON({
            includeId: true
          })
        ],
        orders_packages: [
          ordersPackage.toJSON({
            includeId: true
          })
        ]
      }
    });
    user_profile = {
      id: user.id,
      first_name: user.get("firstName"),
      last_name: user.get("lastName"),
      mobile: user.get("mobile"),
      user_role_ids: [userRole.get("id")]
    };
  },

  afterEach: function() {
    $.mockjax.clear();
    Ember.run(App, App.destroy);
  }
});

test("Account details page displays all user and organisation user details", function(assert) {
  organisationsUser = make("organisations_user", {
    user: user,
    organisation: organisation
  });

  $.mockjax({
    url: "/api/v1/auth/current_user_profil*",
    responseText: {
      user_profile: user_profile,
      organisations: [
        organisation.toJSON({
          includeId: true
        })
      ],
      organisations_users: [
        organisationsUser.toJSON({
          includeId: true
        })
      ]
    }
  });

  assert.expect(6);
  visit("/account_details");

  andThen(function() {
    assert.equal(currentURL(), "/account_details");
    assert.equal($("#firstName").val(), user.get("firstName"));
    assert.equal($("#lastName").val(), user.get("lastName"));
    assert.equal($(".email-disabled")[0].innerText, user.get("email"));
    assert.equal($("#organisation_details").val(), organisation.get("nameEn"));
    assert.equal($("#position").val(), organisationsUser.get("position"));
  });
});

test("After saving user details user gets redirected to browse page", function(assert) {
  organisationsUser = make("organisations_user", {
    user: user,
    organisation: organisation,
    preferredConatctNumber: "88888888"
  });
  $.mockjax({
    url: "/api/v1/auth/current_user_profil*",
    responseText: {
      user: user_profile,
      organisations: [
        organisation.toJSON({
          includeId: true
        })
      ],
      organisations_users: [
        organisationsUser.toJSON({
          includeId: true
        })
      ]
    }
  });

  $.mockjax({
    url: "/api/v1/organisations_use*",
    responseText: {
      users: [user_profile],
      organisations: [
        organisation.toJSON({
          includeId: true
        })
      ],
      organisations_users: [
        organisationsUser.toJSON({
          includeId: true
        })
      ]
    }
  });

  $.mockjax({
    url: "api/v1/gc_org*",
    type: "GET",
    responseText: {
      meta: {
        total_pages: 1,
        search: "club"
      },
      gc_organisations: [
        gcOrganisations.toJSON({
          includeId: true
        }),
        organisation.toJSON({
          includeId: true
        })
      ],
      organisations: [
        gcOrganisations.toJSON({
          includeId: true
        }),
        organisation.toJSON({
          includeId: true
        })
      ]
    }
  });

  $.mockjax({
    url: "/api/v1/org*",
    type: "POST",
    status: 200,
    responseText: {
      users: [
        user.toJSON({
          includeId: true
        })
      ],
      organisations: [
        organisation.toJSON({
          includeId: true
        })
      ],
      organisations_users: [
        organisationsUser.toJSON({
          includeId: true
        })
      ]
    }
  });

  $.mockjax({
    url: "/api/v1/org*",
    type: "PUT",
    status: 200,
    responseText: {
      users: [
        user.toJSON({
          includeId: true
        })
      ],
      organisations: [
        organisation.toJSON({
          includeId: true
        })
      ],
      organisations_users: [
        organisationsUser.toJSON({
          includeId: true
        })
      ]
    }
  });

  visit("/account_details");
  andThen(function() {
    click(".expand_button");
  });

  andThen(function() {
    assert.equal(currentURL(), "/browse");
  });
});

test("User redirects to search_organisation page on clicking Organisation Name Input", function(assert) {
  user_profile = {
    id: user1.id,
    first_name: user1.get("firstName"),
    last_name: user1.get("lastName"),
    mobile: user1.get("mobile"),
    user_role_ids: [userRole.get("id")]
  };
  $.mockjax({
    url: "/api/v1/auth/current_user_profil*",
    responseText: {
      user_profile: user_profile
    }
  });

  assert.expect(2);
  visit("/account_details");
  andThen(function() {
    assert.equal(currentURL(), "/account_details");
    click("#organisation_details");
    andThen(function() {
      assert.equal(currentURL(), "/search_organisation");
    });
  });
});
