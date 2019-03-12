import Ember from "ember";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("orders_package", {
  needs: ["model:package", "model:order"]
});

test("Relationship with other models", function(assert) {
  assert.expect(4);

  var orders_package = this.store().modelFor("orders_package");
  var relationshipsWithPackage = Ember.get(
    orders_package,
    "relationshipsByName"
  ).get("package");
  var relationshipsWithOrder = Ember.get(
    orders_package,
    "relationshipsByName"
  ).get("order");

  assert.equal(relationshipsWithPackage.key, "package");
  assert.equal(relationshipsWithPackage.kind, "belongsTo");

  assert.equal(relationshipsWithOrder.key, "order");
  assert.equal(relationshipsWithOrder.kind, "belongsTo");
});

test("Checking computed properties", function(assert) {
  assert.expect(2);
  var orders_package = this.subject({ state: "designated", quantity: 6 });
  assert.equal(orders_package.get("availableQty"), 6);
  assert.equal(orders_package.get("isSingleQuantity"), false);
});

test("Check attributes", function(assert) {
  assert.expect(2);

  var model = this.subject();

  var quantity = Object.keys(model.toJSON()).indexOf("quantity") > -1;
  var state = Object.keys(model.toJSON()).indexOf("state") > -1;

  assert.ok(quantity);
  assert.ok(state);
});

test("OrdersPackage is valid data model", function(assert) {
  assert.expect(1);

  var store = this.store();
  var record = null;

  Ember.run(function() {
    store.createRecord("ordersPackage", { id: 1, quantity: 1 });
    record = store.peekRecord("ordersPackage", 1);
  });

  assert.equal(record.get("quantity"), 1);
});
