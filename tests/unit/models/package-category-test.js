import { compare } from "@ember/utils";
import { run } from "@ember/runloop";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("package-category", {
  needs: ["model:item"]
});

test("Valid ember-data Model", function(assert) {
  var record;
  var subject = this.subject();

  run(function() {
    subject.store.createRecord("packageCategory", { id: 1, name: "Test" });
    record = subject.store.peekRecord("packageCategory", 1);
  });

  assert.equal(record.get("name"), "Test");
});

test("parentCategory and allChildCategories", function(assert) {
  var parent, child;
  var subject = this.subject();

  run(function() {
    subject.store.createRecord("packageCategory", { id: 1 });
    parent = subject.store.peekRecord("packageCategory", 1);

    subject.store.createRecord("packageCategory", { id: 2, parentId: 1 });
    child = subject.store.peekRecord("packageCategory", 2);
  });

  // verify parentCategory
  assert.equal(parent.get("parentCategory"), null);
  assert.equal(child.get("parentCategory.id"), parent.id);

  // verify allChildCategories
  assert.equal(parent.get("allChildCategories.firstObject.id"), child.id);
  assert.equal(child.get("allChildCategories.length"), 0);
});

test("Check attributes", function(assert) {
  assert.expect(3);

  var model = this.subject();

  var parentId = Object.keys(model.toJSON()).indexOf("parentId") > -1;
  var name = Object.keys(model.toJSON()).indexOf("name") > -1;
  var packageTypeCodes =
    Object.keys(model.toJSON()).indexOf("packageTypeCodes") > -1;

  assert.ok(parentId);
  assert.ok(name);
  assert.ok(packageTypeCodes);
});

test("nameItemsCount: Returns name and items count", function(assert) {
  var packageCategory = this.subject({ id: 1, name: "Name" });

  assert.equal(packageCategory.get("nameItemsCount"), "Name (0)");
});

test("packageTypes: returns blank array if no packageTypes are present", function(assert) {
  var model = this.subject();

  assert.expect(2);
  assert.equal(model.get("packageTypes.length"), 0);
  assert.equal(compare(model.get("packageTypes"), []), 0);
});
