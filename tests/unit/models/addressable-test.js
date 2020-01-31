import { get } from "@ember/object";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("addressable", "Addressable Model", {
  needs: ["model:address"]
});

test("Relationship with other models", function(assert) {
  assert.expect(2);

  var addressable = this.store().modelFor("addressable");
  var relationshipsWithAddress = get(addressable, "relationshipsByName").get(
    "address"
  );

  assert.equal(relationshipsWithAddress.key, "address");
  assert.equal(relationshipsWithAddress.kind, "belongsTo");
});
