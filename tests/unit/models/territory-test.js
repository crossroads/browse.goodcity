import Ember from "ember";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("territory", {
  needs: ["model:district", "model:user-role"]
});

test("Relationship with other models", function(assert) {
  assert.expect(2);

  var territory = this.store().modelFor("territory");
  var relationshipsWithDistrict = Ember.get(
    territory,
    "relationshipsByName"
  ).get("districts");

  assert.equal(relationshipsWithDistrict.key, "districts");
  assert.equal(relationshipsWithDistrict.kind, "hasMany");
});

test("Check attributes", function(assert) {
  assert.expect(1);

  var model = this.subject();

  var name = Object.keys(model.toJSON()).indexOf("name") > -1;

  assert.ok(name);
});

test("Territory is valid data model", function(assert) {
  assert.expect(1);

  var store = this.store();
  var record = null;

  Ember.run(function() {
    store.createRecord("territory", { id: 1, name: "territory" });
    record = store.peekRecord("territory", 1);
  });

  assert.equal(record.get("name"), "territory");
});
