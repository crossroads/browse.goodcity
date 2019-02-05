import Ember from 'ember';
import _ from 'lodash';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import { make, mockFindAll } from 'ember-data-factory-guy';

var App, image, pkg, pkgCategory1, pkgType, order, order2, orders_package, order_transport, order_transport2;
let mocks;

var userProfile = {
  "user_profile": [{
    "id": 2,
    "first_name": "David",
    "last_name": "Dara51",
    "mobile": "61111111",
    "user_role_ids": [1]
  }],
  "users": [{
    "id": 2,
    "first_name": "David",
    "last_name": "Dara51",
    "mobile": "61111111"
  }],
  "roles": [
    {"id": 4, "name": "Supervisor"}
  ],
  "user_roles": [
    {"id": 1, "user_id": 2, "role_id": 4}
  ]
};

const beneficiaries = [{
  id: 1,
  identity_type_id: 1,
  identity_number: '4321',
  title: 'Mr',
  first_name: 'Brian',
  last_name: 'May',
  phone: '97619088'
}];

function pluralize(name) {
  if (/y$/.test(name)) {
    return name.replace(/y$/, 'ies');
  }
  return name + 's';
}

module('Acceptance | My Orders Page', {
  beforeEach: function() {
    App = startApp();
    pkgType      = make("package_type_with_packages");
    image        = make("image", { id: 1 });
    pkgCategory1 = make("parent_package_category");
    pkg = make('package', { imageIds: [ image.get('id') ]});
    orders_package = make("orders_package", { package: pkg, packageId: pkg.get('id' )});
    order_transport = make('order_transport', { scheduledAt: new Date(2018, 10, 19, 16, 0) });
    order = make("order", { state: 'submitted', orderTransportId: order_transport.get('id'), orderTransport: order_transport, ordersPackages: [ orders_package ] });
    order_transport2 = make('order_transport');
    order2 = make("order", { orderTransportId: order_transport2.get('id'), orderTransport: order_transport2 });


    $.mockjaxSettings.matchInRegistrationOrder = false;

    mocks = [];

    const doMock = (modelName, data) => {
      if (_.isArray(data)) {
        data = { [pluralize(modelName)]: data };
      }
      mocks.push(
        $.mockjax({ url: `/api/v1/${modelName}*`, responseText: data })
      );
      mockFindAll(modelName).returns({
        json: data
      });
    };

    doMock("beneficiary", beneficiaries);
    doMock("gogovan_transport", [ make("gogovan_transport").toJSON({includeId: true}) ]);
    doMock("booking_type", [ make("booking_type").toJSON({includeId: true})]);
    doMock("purpose", [ make("purpose").toJSON({includeId: true})]);
    doMock('order_transport', [ order_transport.toJSON({includeId: true}), order_transport2.toJSON({includeId: true}) ]);
    doMock('order', {
      orders: [ order.toJSON({includeId: true}), order2.toJSON({includeId: true}) ],
      packages: [ pkg.toJSON({includeId: true}) ],
      orders_packages: [ orders_package.toJSON({includeId: true}) ],
      order_transports: [ order_transport.toJSON({includeId: true}), order_transport2.toJSON({includeId: true}) ]
    });

    mocks.push(
      $.mockjax({url:"/api/v1/auth/current_user_profil*", responseText: userProfile })
    );

    mocks.push(
      $.mockjax({ url: `/api/v1/orders/${order.get('id')}`, responseText: {
        order: order.toJSON({ includeId: true })
      }})
    );

    mocks.push(
      $.mockjax({ url: /\/api\/v1\/images\/\d/, responseText: {
        image: image.toJSON({ includeId: true })
      }})
    );

    visit("/");

    andThen(() => {
      visit("/my_orders");
    });
  },

  afterEach: function() {
    $.mockjaxSettings.matchInRegistrationOrder = true;
    mocks.forEach($.mockjax.clear);
    Ember.run(App, App.destroy);
  }
});

test("should redirect to my orders page", function(assert) {
  assert.expect(2);
  visit("/my_orders");

  andThen(function() {
    assert.equal(currentURL(), '/my_orders');
    assert.equal(Ember.$('.my_orders .title').text(), "My Orders");
  });
});

test("should list all orders to the user", function(assert) {
  assert.expect(2);
  assert.ok(Ember.$('.list-items'));
  assert.equal(Ember.$('.list-items .order_block').length, 2);
});

test("should show the scheduled date on each item", function(assert) {
  assert.expect(2);
  assert.ok(Ember.$('.list-items'));
  assert.equal(Ember.$('.list-items .order_block .value.schedule').text().trim(), "Monday 19th November 04:00 pm");
});

test("clicking on an order opens the summary", function(assert) {
  assert.expect(1);

  click(Ember.$('.list-items .order_block')[0]);

  andThen(() => {
    assert.equal(Ember.$('.order-summary').length, 1);
  });
});

test("the summary booking tab is selected by default", function(assert) {
  assert.expect(1);

  click(Ember.$('.list-items .order_block')[0]);
  andThen(() => {
    assert.equal(Ember.$('.order-summary .tabs .tab.booking.selected').length, 1);
  });
});

test("the summary goods tab is un-selected by default", function(assert) {
  assert.expect(1);
  click(Ember.$('.list-items .order_block')[0]);
  andThen(() => {
    assert.equal(Ember.$('.order-summary .tabs .tab.goods.dimmed').length, 1);
  });
});

test("clicking on the goods tab selects it", function(assert) {
  assert.expect(1);
  click(Ember.$('.list-items .order_block')[0]);
  andThen(() => {
    click(Ember.$('.order-summary .tabs .tab.goods.dimmed'));
  });
  andThen(() => {
    assert.equal(Ember.$('.order-summary .tabs .tab.goods.selected').length, 1);
  });
});

test("on the good tabs, we can see the packages of the order listed", function(assert) {
  assert.expect(4);
  click(Ember.$('.list-items .order_block')[0]);
  andThen(() => {
    click(Ember.$('.order-summary .tabs .tab.goods.dimmed'));
  });
  andThen(() => {
    assert.equal(Ember.$('.order-summary .tabs .tab.goods.selected').length, 1);
    assert.equal(Ember.$('.goods-tab .product-row').length, 1);
    assert.equal(Ember.$('.goods-tab .product-row .text').text().trim(), "Category4");
    assert.equal(Ember.$('.goods-tab .product-row .notes').text().trim(), "example");
  });
});
