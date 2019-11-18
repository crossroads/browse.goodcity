import { run, scheduleOnce } from "@ember/runloop";
import { module, test } from "qunit";
import startApp from "../helpers/start-app";
import { make } from "ember-data-factory-guy";
import { mockFindAll } from "ember-data-factory-guy";
// import FactoryGuy from 'ember-data-factory-guy';

var App,
  pkgCategory,
  subcategory1,
  item,
  itemPkg1,
  itemPkg2,
  pkg,
  pkg2,
  pkgType1,
  pkgType2,
  subcategory2,
  order,
  ordersPackage,
  gogo_van,
  order_purpose,
  user,
  bookingType,
  purpose,
  mocks;

module("Acceptance | Cart Page", {
  needs: ["service:subscription"],
  beforeEach: function() {
    $.mockjaxSettings.matchInRegistrationOrder = false;
    window.localStorage.authToken =
      '"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo2LCJpYXQiOjE1MTg3NzI4MjcsImlzcyI6Ikdvb2RDaXR5SEsiLCJleHAiOjE1MTk5ODI0Mjd9.WdsVvss9khm81WNScV5r6DiIwo8CQfHM1c4ON2IACes"';
    App = startApp();
    mocks = [];
    pkgType1 = make("package_type_with_packages");
    pkgType2 = make("package_type_with_packages");
    pkgCategory = make("parent_package_category");
    user = make("user");
    let organisation = make("organisation");
    let organisationsUser = make("organisations_user", {
      organisation: organisation,
      user: user
    });
    order = make("order", { state: "draft", created_by_id: user.id });
    pkg = make("package");
    pkg2 = make("package");
    item = make("item");
    itemPkg1 = make("package", { item: item, itemId: item.get("id") });
    itemPkg2 = make("package", { item: item, itemId: item.get("id") });
    ordersPackage = make("orders_package", {
      quantity: 1,
      state: "requested",
      package: pkg,
      packageId: pkg.id,
      order: order
    });
    order_purpose = make("orders_purpose");
    subcategory1 = make("package_category", {
      parentId: parseInt(pkgCategory.id),
      packageTypeCodes: pkgType1.get("code")
    });
    subcategory2 = make("package_category", {
      parentId: parseInt(pkgCategory.id),
      packageTypeCodes: pkgType2.get("code")
    });
    gogo_van = make("gogovan_transport");
    bookingType = make("booking_type");
    purpose = make("purpose");
    mocks.push(
      $.mockjax({
        url: "/api/v1/requested_package*",
        type: "GET",
        responseText: {
          packages: [
            itemPkg1.toJSON({ includeId: true }),
            itemPkg2.toJSON({ includeId: true }),
            pkg.toJSON({ includeId: true })
          ],
          requested_packages: [
            {
              id: 1,
              package_id: itemPkg1.get("id"),
              user_id: user.get("id"),
              is_available: true
            },
            {
              id: 2,
              package_id: itemPkg2.get("id"),
              user_id: user.get("id"),
              is_available: true
            },
            {
              id: 3,
              package_id: pkg.get("id"),
              user_id: user.get("id"),
              is_available: true
            }
          ]
        }
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

    var data = {
      user_profile: {
        id: 2,
        first_name: "David",
        last_name: "Dara51",
        mobile: "61111111",
        user_role_ids: [1]
      },
      users: [
        { id: 2, first_name: "David", last_name: "Dara51", mobile: "61111111" }
      ],
      roles: [
        {
          id: 4,
          name: "Supervisor"
        },
        {
          id: 3,
          name: "Charity"
        }
      ],
      user_roles: [
        {
          id: 1,
          user_id: user.id,
          role_id: 4
        },
        {
          id: 2,
          user_id: user.id,
          role_id: 3
        }
      ],
      organisations: [organisation.toJSON({ includeId: true })],
      organisations_user: [organisationsUser.toJSON({ includeId: true })]
    };

    mocks.push(
      $.mockjax({
        url: "/api/v1/auth/current_user_profil*",
        responseText: data
      })
    );

    mockFindAll("order").returns({
      json: {
        orders: [order.toJSON({ includeId: true })],
        packages: [pkg.toJSON({ includeId: true })],
        orders_packages: [ordersPackage.toJSON({ includeId: true })]
      }
    });

    visit("/");
  },

  afterEach: function() {
    // Clear our ajax mocks
    $.mockjaxSettings.matchInRegistrationOrder = true;
    mocks.forEach($.mockjax.clear);

    run(App, App.destroy);
  }
});

test("Request and remove items from the cloud cart", function(assert) {
  let cartItemCreated = false;
  let cartItemDeleted = false;
  mocks.push(
    $.mockjax({
      url: "/api/v1/order*",
      type: "POST",
      status: 200,
      responseText: {
        order: order.toJSON({ includeId: true }),
        orders_purposes: [order_purpose.toJSON({ includeId: true })]
      }
    }),
    $.mockjax({
      url: "/api/v1/requested_package*",
      type: "POST",
      status: 200,
      onAfterComplete: () => {
        cartItemCreated = true;
      },
      response: function(req) {
        this.responseText = {
          requested_package: {
            id: 999,
            package_id: pkg2.get("id"),
            user_id: user.get("id"),
            is_available: true
          }
        };
      }
    }),
    $.mockjax({
      url: "/api/v1/requested_package*",
      type: "DELETE",
      status: 200,
      onAfterComplete: () => {
        cartItemDeleted = true;
      },
      responseText: {}
    }),
    $.mockjax({
      url: "/api/v1/order*",
      type: "PUT",
      status: 200,
      responseText: {
        order: order.toJSON({ includeId: true }),
        orders_purposes: [order_purpose.toJSON({ includeId: true })]
      }
    })
  );

  visit(
    "/item/" + pkg2.id + "?categoryId=" + pkgCategory.id + "&sortBy=createdAt"
  );
  andThen(function() {
    assert.equal(
      currentURL(),
      "/item/" + pkg2.id + "?categoryId=" + pkgCategory.id + "&sortBy=createdAt"
    );
    $(".request-item").click();
    andThen(function() {
      visit("/cart");
      andThen(function() {
        assert.equal(cartItemCreated, true);
        assert.equal(find(".item-collection li").length, 3);
        click(".item-collection li:first span");
        andThen(function() {
          assert.equal(find(".item-collection li").length, 2);
          assert.equal(cartItemDeleted, true);
        });
      });
    });
  });
});

test("Packages are grouped as items", function(assert) {
  const cart = App.__container__.lookup("service:cart");
  const store = App.__container__.lookup("service:store");

  visit("/cart");
  andThen(function() {
    assert.equal(find(".item-collection li").length, 2);
    const groups = cart.get("groupedPackages");
    assert.equal(groups.length, 2);
    assert.equal(groups[0].record.get("id"), item.get("id"));
    assert.equal(groups[1].record.get("id"), pkg.get("id"));

    const cartItem = store
      .peekAll("requested_package")
      .findBy("packageId", itemPkg1.get("id"));

    cartItem.set("isAvailable", false);

    andThen(function() {
      const updatedGroups = cart.get("groupedPackages");
      assert.equal(updatedGroups.length, 3);
      assert.equal(updatedGroups[0].record.get("id"), itemPkg1.get("id"));
      assert.equal(updatedGroups[0].isAvailable, false);
      assert.equal(updatedGroups[1].record.get("id"), itemPkg2.get("id"));
      assert.equal(updatedGroups[2].record.get("id"), pkg.get("id"));

      scheduleOnce("afterRender", () => {
        assert.equal(find(".item-collection li").length, 3);
        assert.equal(
          find(".item-collection li:first .unavailable")
            .text()
            .trim(),
          "Sorry! This item is no longer available."
        );
      });
    });
  });
});
