import { run } from "@ember/runloop";
import { get } from "@ember/object";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("contact", "Model Contact", {
  needs: ["model:address"]
});

test("Relationship", function(assert) {
  assert.expect(2);

  var contact = this.store().modelFor("contact");
  var relationshipsWithAddress = get(contact, "relationshipsByName").get(
    "address"
  );

  assert.equal(relationshipsWithAddress.key, "address");
  assert.equal(relationshipsWithAddress.kind, "belongsTo");
});

test("Attributes", function(assert) {
  var model = this.subject();

  var name = Object.keys(model.toJSON()).indexOf("name") > -1;
  var mobile = Object.keys(model.toJSON()).indexOf("mobile") > -1;

  assert.ok(name);
  assert.ok(mobile);
});

test("Contact is a valid ember-data Model", function(assert) {
  assert.expect(1);

  var store = this.store();
  var record = null;

  run(function() {
    store.createRecord("contact", { id: 1, name: "John" });
    record = store.peekRecord("contact", 1);
  });

  assert.equal(record.get("name"), "John");
});
