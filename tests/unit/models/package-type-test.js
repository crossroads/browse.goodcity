import { compare } from "@ember/utils";
import { run } from "@ember/runloop";
import { get } from "@ember/object";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("package-type", {
  needs: ["model:item", "model:package", "model:image", "model:donor-condition"]
});

test("item relationship", function(assert) {
  var packageType = this.subject().store.modelFor("packageType");
  var relationship = get(packageType, "relationshipsByName").get("items");

  assert.equal(relationship.key, "items");
  assert.equal(relationship.kind, "hasMany");
});

test("Valid ember-data Model", function(assert) {
  var record;
  var subject = this.subject();

  run(function() {
    subject.store.createRecord("packageType", { id: 1, name: "Test" });
    record = subject.store.peekRecord("packageType", 1);
  });

  assert.equal(record.get("name"), "Test");
});

test("_packages: Returns all packages", function(assert) {
  var package1, package2, store, model;

  store = this.store();
  model = this.subject();

  run(function() {
    package1 = store.createRecord("package", { id: 1, availableQuantity: 1 });
    package2 = store.createRecord("package", {
      id: 2,
      quaavailableQuantityntity: 1
    });
  });

  assert.equal(model.get("_packages.length"), 2);
});

test("getItemPackageList: it returns single packages with no siblings", function(assert) {
  var package1, store, model;

  store = this.store();
  model = this.subject();

  run(function() {
    package1 = store.createRecord("package", {
      id: 1,
      availableQuantity: 1,
      isAvailable: true,
      hasSiblingPackages: false
    });
    model.get("packages").pushObjects([package1]);
  });

  assert.equal(model.get("getItemPackageList.length"), 1);
  assert.equal(compare(model.get("getItemPackageList"), [package1]), 0);
});

test("getItemPackageList: list of associated items if package has sibling", function(assert) {
  var package1, item, store, model;

  store = this.store();
  model = this.subject();

  run(function() {
    item = store.createRecord("item", { id: 1, saleable: true });
    package1 = store.createRecord("package", {
      id: 1,
      availableQuantity: 1,
      isAvailable: true,
      hasSiblingPackages: true,
      item: item
    });
    model.get("packages").pushObjects([package1]);
  });

  assert.equal(model.get("getItemPackageList.length"), 1);
  assert.equal(compare(model.get("getItemPackageList"), [item]), 0);
});
