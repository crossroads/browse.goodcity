import Ember from "ember";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("order_transport", {
  needs: ["model:contact", "model:order", "model:gogovanTransport"]
});

test("Relationship with other models", function(assert) {
  assert.expect(6);

  var order_transport = this.store().modelFor("order_transport");
  var relationshipsWithContact = Ember.get(
    order_transport,
    "relationshipsByName"
  ).get("contact");
  var relationshipsWithOrder = Ember.get(
    order_transport,
    "relationshipsByName"
  ).get("order");
  var relationshipsWithGogovanTransport = Ember.get(
    order_transport,
    "relationshipsByName"
  ).get("gogovanTransport");

  assert.equal(relationshipsWithContact.key, "contact");
  assert.equal(relationshipsWithContact.kind, "belongsTo");

  assert.equal(relationshipsWithOrder.key, "order");
  assert.equal(relationshipsWithOrder.kind, "belongsTo");

  assert.equal(relationshipsWithGogovanTransport.key, "gogovanTransport");
  assert.equal(relationshipsWithGogovanTransport.kind, "belongsTo");
});

test("Check attributes", function(assert) {
  assert.expect(7);

  var model = this.subject();

  var timeslot = Object.keys(model.toJSON()).indexOf("timeslot") > -1;
  var transportType = Object.keys(model.toJSON()).indexOf("transportType") > -1;
  var vehicleType = Object.keys(model.toJSON()).indexOf("vehicleType") > -1;
  var scheduledAt = Object.keys(model.toJSON()).indexOf("scheduledAt") > -1;
  var needEnglish = Object.keys(model.toJSON()).indexOf("needEnglish") > -1;
  var needCart = Object.keys(model.toJSON()).indexOf("needCart") > -1;
  var needCarry = Object.keys(model.toJSON()).indexOf("needCarry") > -1;

  assert.ok(timeslot);
  assert.ok(transportType);
  assert.ok(vehicleType);
  assert.ok(scheduledAt);
  assert.ok(needEnglish);
  assert.ok(needCart);
  assert.ok(needCarry);
});

test("OrderTransport is valid data model", function(assert) {
  assert.expect(1);

  var store = this.store();
  var record = null;

  Ember.run(function() {
    store.createRecord("orderTransport", { id: 1, transportType: "gogovan" });
    record = store.peekRecord("orderTransport", 1);
  });

  assert.equal(record.get("transportType"), "gogovan");
});
