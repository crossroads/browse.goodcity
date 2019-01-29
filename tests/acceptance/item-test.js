import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'browse/tests/helpers/start-app';
import FactoryGuy from 'ember-data-factory-guy';
import { make, mockFindAll } from 'ember-data-factory-guy';
import testSkip from 'browse/tests/helpers/test-skip';

var pkgCategory, subcategory1, pkgType1, subcategory2, role, order,ordersPackage, pkg, gogo_van, organisation, user, userRole, item_with_packages, prev_item, item, next_item, item_path, user_profile, bookingType, purpose;

module('Acceptance | Item Page', {
  beforeEach: function() {
    this.application = startApp();

    pkgType1 = FactoryGuy.make("package_type");
    item_with_packages = FactoryGuy.make("received_item");
    next_item = FactoryGuy.make("received_item");
    item = FactoryGuy.make("received_item");
    prev_item = FactoryGuy.make("received_item");
    organisation = make("organisation");
    pkg = make('package');
    gogo_van = make("gogovan_transport");
    bookingType = make("booking_type");
    purpose = make("purpose");
    role = make("role");
    user = make("user");
    userRole = make("user_role", { userId: user.id, roleId: role.id, user: user, role: role });
    order = make("order", { state: "draft", created_by_id: user.id });
    ordersPackage = make("orders_package", { quantity: 1, state: "requested", package: pkg, packageId: pkg.id, order: order});
    pkgCategory  = FactoryGuy.make("parent_package_category");
    subcategory1 = FactoryGuy.make("package_category", {parent_id: parseInt(pkgCategory.id), packagr_type_codes: pkgType1.get("code") });
    subcategory2 = FactoryGuy.make("package_category", {parent_id: parseInt(pkgCategory.id), packagr_type_codes: pkgType1.get("code") });
    user_profile = {"id": user.id,"first_name": user.get('firstName'), "last_name": user.get('lastName'), "mobile": user.get('mobile')};
    mockFindAll("package_category").returns({json: {package_categories: [pkgCategory.toJSON({includeId: true}), subcategory1.toJSON({includeId: true}), subcategory2.toJSON({includeId: true})]}});
    mockFindAll("package_type").returns({json: {package_types: [pkgType1.toJSON({includeId: true})]}});
    mockFindAll("booking_type").returns({json: {booking_types: [bookingType.toJSON({includeId: true})]}});
    mockFindAll("purpose").returns({json: {purposes: [purpose.toJSON({includeId: true})]}});
    mockFindAll('item').returns({json: {items: [item_with_packages.toJSON({includeId: true}), next_item.toJSON({includeId: true}), item.toJSON({includeId: true}), prev_item.toJSON({includeId: true})]}});

    item_path = "/item/" + item.id +"?categoryId="+ pkgCategory.id +"&sortBy=createdAt%3Adesc";
    mockFindAll("gogovan_transport").returns({json: {gogovan_transports: [gogo_van.toJSON({includeId: true})]}});
    mockFindAll('order').returns({ json: {orders: [order.toJSON({includeId: true})], packages: [pkg.toJSON({includeId: true})], orders_packages: [ordersPackage.toJSON({includeId: true})]}});
    $.mockjax({url:"/api/v1/auth/current_user_profil*",
      responseText: {
        user_profile: user_profile,
        organisations: [organisation.toJSON({includeId: true})]
      }});
  },

  afterEach: function() {
    Ember.run(this.application, 'destroy');
  }
});

test("should redirect item page and Display details", function(assert) {
  var item_path = "/item/" + item_with_packages.id +"?categoryId="+ pkgCategory.id +"&sortBy=createdAt%3Adesc";
  visit(item_path);

  andThen(function() {
    assert.equal(currentURL(), item_path);

    // Display all the associated items
    assert.equal(Ember.$('.main-section .item_name:first').text(), item_with_packages.get('packages.firstObject.notes'));

    // Verify donorCondition
    assert.equal(Ember.$('.main-section .item_details:first').text().indexOf(item_with_packages.get('donorCondition.name')) > 0, true);

    // Verify quantity
    assert.equal(Ember.$('.main-section .item_details:eq(1)').text().indexOf(item_with_packages.get('packages.firstObject.quantity')) > 0, true);

    // verify dimension
    assert.equal(Ember.$('.main-section .item_details:eq(3)').text().indexOf(item_with_packages.get('packages.firstObject.dimensions')) > 0, true);

    // verify packages details length
    assert.equal(Ember.$('.main-section .item_name').length, item_with_packages.get('packages.length'));
  });
});

testSkip("should redirect previous item", function(assert) {
  var prev_item_path = "/item/" + prev_item.id +"?categoryId="+ pkgCategory.id +"&sortBy=createdAt%3Adesc";

  visit(item_path);

  andThen(function() {
    assert.equal(currentURL(), item_path);

    click("ul.pagination li:first");
    andThen(function(){
      assert.equal(currentURL(), prev_item_path);
    });
  });
});


testSkip("should redirect next item", function(assert) {
  var next_item_path = "/item/" + next_item.id +"?categoryId="+ pkgCategory.id +"&sortBy=createdAt%3Adesc";

  visit(item_path);

  andThen(function() {
    assert.equal(currentURL(), item_path);

    click("ul.pagination li:last");
    andThen(function(){
      assert.equal(currentURL(), next_item_path);
    });
  });
});

test("should display inventory number for order fulfillment user", function(assert) {
  var item_path = "/item/" + item_with_packages.id +"?categoryId="+ pkgCategory.id +"&sortBy=createdAt%3Adesc";
  visit(item_path);

  andThen(function() {
    assert.equal(currentURL(), item_path);
    // Display inventory Number
    assert.equal(Ember.$('.inventory_redirect:first').text(), pkg.get('inventoryNumber'));
  });
});
