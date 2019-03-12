import Ember from "ember";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("organisation", {
  needs: ["model:user"]
});

test("Check relationship with other models", function(assert) {
  assert.expect(2);

  var organisation = this.store().modelFor("organisation");
  var relationshipsWithUser = Ember.get(
    organisation,
    "relationshipsByName"
  ).get("user");

  assert.equal(relationshipsWithUser.key, "user");
  assert.equal(relationshipsWithUser.kind, "belongsTo");
});

test("Check attributes", function(assert) {
  assert.expect(6);

  var model = this.subject();

  var nameEn = Object.keys(model.toJSON()).indexOf("nameEn") > -1;
  var nameZhTw = Object.keys(model.toJSON()).indexOf("nameZhTw") > -1;
  var registration = Object.keys(model.toJSON()).indexOf("registration") > -1;
  var website = Object.keys(model.toJSON()).indexOf("website") > -1;
  var descriptionEn = Object.keys(model.toJSON()).indexOf("descriptionEn") > -1;
  var descriptionZhTw =
    Object.keys(model.toJSON()).indexOf("descriptionZhTw") > -1;

  assert.ok(nameEn);
  assert.ok(nameZhTw);
  assert.ok(registration);
  assert.ok(website);
  assert.ok(descriptionEn);
  assert.ok(descriptionZhTw);
});

test("check nameAndDescription computed property", function(assert) {
  assert.expect(1);
  var organisation = this.subject({
    nameEn: "Crossroads",
    descriptionEn: "Foundation"
  });
  assert.equal(organisation.get("nameAndDescription"), "Crossroads Foundation");
});

test("Organisation is valid data model", function(assert) {
  assert.expect(1);

  var store = this.store();
  var record = null;

  Ember.run(function() {
    store.createRecord("organisation", { id: 1, nameEn: "Organisation" });
    record = store.peekRecord("organisation", 1);
  });

  assert.equal(record.get("nameEn"), "Organisation");
});
