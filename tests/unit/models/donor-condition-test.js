import Ember from "ember";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("donor-condition", {
  needs: ["model:item"]
});

test("item relationship", function(assert) {
  assert.expect(2);

  var donorCondition = this.subject().store.modelFor("donorCondition");
  var relationship = Ember.get(donorCondition, "relationshipsByName").get(
    "items"
  );

  assert.equal(relationship.key, "items");
  assert.equal(relationship.kind, "hasMany");
});

test("check attributes", function(assert) {
  assert.expect(1);

  var model = this.subject();

  var name = Object.keys(model.toJSON()).indexOf("name") > -1;
  assert.ok(name);
});

test("check name computed property", function(assert) {
  assert.expect(1);

  var model = this.subject({ name: "Used" });

  assert.equal(model.get("name"), "Used");
});

test("Valid ember-data Model", function(assert) {
  assert.expect(1);

  var record;
  var subject = this.subject();

  Ember.run(function() {
    subject.store.createRecord("donorCondition", { id: 1, name: "Test" });
    record = subject.store.peekRecord("donorCondition", 1);
  });

  assert.equal(record.get("name"), "Test");
});
