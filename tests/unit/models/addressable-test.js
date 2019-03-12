import { test, moduleForModel } from "ember-qunit";
import Ember from "ember";

moduleForModel("addressable", "Addressable Model", {
  needs: ["model:address"]
});

test("Relationship with other models", function(assert) {
  assert.expect(2);

  var addressable = this.store().modelFor("addressable");
  var relationshipsWithAddress = Ember.get(
    addressable,
    "relationshipsByName"
  ).get("address");

  assert.equal(relationshipsWithAddress.key, "address");
  assert.equal(relationshipsWithAddress.kind, "belongsTo");
});
