import Ember from "ember";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("order", {
  needs: [
    "model:orders_package",
    "model:order_transport",
    "model:user",
    "model:organisation",
    "model:address",
    "model:organisations-user",
    "model:package",
    "model:item",
    "model:package-type",
    "model:image",
    "model:donor-condition",
    "model:user-role",
    "model:role",
    "model:orders-purpose",
    "service:i18n"
  ]
});

test("Relationship with other models", function(assert) {
  assert.expect(4);

  var order = this.store().modelFor("order");
  var relationshipWithOrdersPackage = Ember.get(
    order,
    "relationshipsByName"
  ).get("ordersPackages");
  var relationshipWithOrderTransport = Ember.get(
    order,
    "relationshipsByName"
  ).get("orderTransport");

  assert.equal(relationshipWithOrdersPackage.key, "ordersPackages");
  assert.equal(relationshipWithOrdersPackage.kind, "hasMany");

  assert.equal(relationshipWithOrderTransport.key, "orderTransport");
  assert.equal(relationshipWithOrderTransport.kind, "belongsTo");
});

test("check attributes", function(assert) {
  assert.expect(5);

  var model = this.subject();

  var purposeDescription =
    Object.keys(model.toJSON()).indexOf("purposeDescription") > -1;
  var code = Object.keys(model.toJSON()).indexOf("code") > -1;
  var state = Object.keys(model.toJSON()).indexOf("state") > -1;
  var createdAt = Object.keys(model.toJSON()).indexOf("createdAt") > -1;
  var updatedAt = Object.keys(model.toJSON()).indexOf("updatedAt") > -1;

  assert.ok(purposeDescription);
  assert.ok(code);
  assert.ok(state);
  assert.ok(createdAt);
  assert.ok(updatedAt);
});

test("Order is valid data model", function(assert) {
  assert.expect(1);

  var record;
  var user;
  var subject = this.subject();

  Ember.run(function() {
    subject.store.createRecord("user", { id: 1, firstName: "abc" });
    user = subject.store.peekRecord("user", 1);
    subject.store.createRecord("order", {
      id: 1,
      code: "LocalOrder",
      createdById: 1
    });
    record = subject.store.peekRecord("order", 1);
  });

  assert.equal(record.get("code"), "LocalOrder");
});

test("orderItems: returns order package if package do not have sibling", function(assert) {
  var ordersPackage1, package1, model, store;

  assert.expect(2);

  model = this.subject();
  store = this.store();

  Ember.run(function() {
    package1 = store.createRecord("package", { id: 1, quantity: 1 });
    ordersPackage1 = store.createRecord("orders_package", {
      id: 1,
      state: "dispatched",
      package: package1
    });
    model.get("ordersPackages").pushObjects([ordersPackage1]);
  });

  assert.equal(model.get("orderItems").get("length"), 1);
  assert.equal(Ember.compare(model.get("orderItems"), [package1]), 0);
});

test("orderItems: returns order item if package have sibling", function(assert) {
  var ordersPackage1, package1, package2, item, model, store;

  assert.expect(2);

  model = this.subject();
  store = this.store();

  Ember.run(function() {
    item = store.createRecord("item", { id: 1, saleable: true });
    package1 = store.createRecord("package", {
      id: 1,
      quantity: 1,
      item: item
    });
    package2 = store.createRecord("package", {
      id: 2,
      quantity: 1,
      item: item
    });
    ordersPackage1 = store.createRecord("orders_package", {
      id: 1,
      state: "dispatched",
      package: package1
    });
    model.get("ordersPackages").pushObjects([ordersPackage1]);
  });

  assert.equal(model.get("orderItems").get("length"), 1);
  assert.equal(Ember.compare(model.get("orderItems"), [item]), 0);
});

test("orderItems: returns order item if hasSibling is true", function(assert) {
  var ordersPackage1, package1, item, model, store;

  model = this.subject();
  store = this.store();

  Ember.run(function() {
    item = store.createRecord("item", { id: 1, saleable: true });
    package1 = store.createRecord("package", {
      id: 1,
      quantity: 1,
      item: item,
      hasSiblingPackages: true
    });
    ordersPackage1 = store.createRecord("orders_package", {
      id: 1,
      state: "dispatched",
      package: package1
    });
    model.get("ordersPackages").pushObjects([ordersPackage1]);
  });

  assert.equal(model.get("orderItems").get("length"), 1);
  assert.equal(Ember.compare(model.get("orderItems"), [item]), 0);
});
