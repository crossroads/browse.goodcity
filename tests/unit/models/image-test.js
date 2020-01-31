import { run } from "@ember/runloop";
import { get } from "@ember/object";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("image", {
  needs: ["model:package"]
});

test("package relationship", function(assert) {
  var image = this.subject().store.modelFor("image");
  var relationship = get(image, "relationshipsByName").get("package");

  assert.equal(relationship.key, "package");
  assert.equal(relationship.kind, "belongsTo");
});

test("Valid ember-data Model", function(assert) {
  var record;
  var subject = this.subject();

  run(function() {
    subject.store.createRecord("image", { id: 1, favourite: true });
    record = subject.store.peekRecord("image", 1);
  });

  assert.equal(record.get("favourite"), true);
});
