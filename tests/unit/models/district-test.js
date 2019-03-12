import { test, moduleForModel } from "ember-qunit";
import Ember from "ember";

moduleForModel("district", "District Model", {
  needs: ["model:territory"]
});

test("Relationship with other models", function(assert) {
  assert.expect(2);

  var district = this.store().modelFor("district");
  var relationShipWithTerritory = Ember.get(
    district,
    "relationshipsByName"
  ).get("territory");

  assert.equal(relationShipWithTerritory.key, "territory");
  assert.equal(relationShipWithTerritory.kind, "belongsTo");
});

test("check attributes", function(assert) {
  var model = this.subject();

  var name = Object.keys(model.toJSON()).indexOf("name") > -1;
  assert.ok(name);
});

test("District is valid data model", function(assert) {
  assert.expect(1);

  var store = this.store();
  var record = null;

  Ember.run(function() {
    store.createRecord("district", { id: 1, name: "district_name" });
    record = store.peekRecord("district", 1);
  });

  assert.equal(record.get("name"), "district_name");
});
