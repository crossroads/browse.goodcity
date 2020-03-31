import { compare } from "@ember/utils";
import { run } from "@ember/runloop";
import { get } from "@ember/object";

import { test, moduleForModel } from "ember-qunit";

moduleForModel("package", {
  needs: [
    "model:item",
    "model:package-type",
    "model:image",
    "model:donorCondition"
  ]
});

test("item relationship", function(assert) {
  var pkg = this.subject().store.modelFor("package");
  var relationship = get(pkg, "relationshipsByName").get("item");

  assert.equal(relationship.key, "item");
  assert.equal(relationship.kind, "belongsTo");
});

test("packageType relationship", function(assert) {
  var pkg = this.subject().store.modelFor("package");
  var relationship = get(pkg, "relationshipsByName").get("packageType");
  assert.equal(relationship.key, "packageType");
  assert.equal(relationship.kind, "belongsTo");
});

test("Valid ember-data Model", function(assert) {
  var record;
  var subject = this.subject();
  run(function() {
    subject.store.createRecord("package", { id: 1, notes: "Test" });
    record = subject.store.peekRecord("package", 1);
  });

  assert.equal(record.get("notes"), "Test");
});

test("packageName", function(assert) {
  var record, packageType;
  var subject = this.subject();
  run(function() {
    subject.store.createRecord("packageType", { id: 1, name: "Test" });
    packageType = subject.store.peekRecord("packageType", 1);

    subject.store.createRecord("package", {
      id: 1,
      notes: "Test",
      packageType: packageType
    });
    record = subject.store.peekRecord("package", 1);
  });

  assert.equal(record.get("packageName"), "Test");
});

test("dimensions", function(assert) {
  var record;
  var subject = this.subject();

  run(function() {
    subject.store.createRecord("package", {
      id: 1,
      notes: "Test",
      width: 10,
      length: 10,
      height: 10
    });
    record = subject.store.peekRecord("package", 1);
  });

  assert.equal(record.get("dimensions"), "W 10 x H 10 x L 10 cm");
});

test("isDispatched: check package is dispatched or not", function(assert) {
  var record, store;

  assert.expect(1);

  store = this.store();

  run(function() {
    record = store.createRecord("package", {
      id: 1,
      stockitSentOn: "12/2/2017"
    });
  });

  assert.equal(record.get("isDispatched"), true);
});

test("image: returns favourite image", function(assert) {
  var image, package1, model, store;

  model = this.subject();
  store = this.store();

  run(function() {
    package1 = store.createRecord("package", { id: 1, availableQuantity: 2 });
    image = store.createRecord("image", {
      id: 1,
      favourite: true,
      package: package1
    });
  });

  assert.equal(package1.get("image.id"), image.get("id"));
});

test("otherImages", function(assert) {
  var package1, image1, image2, store, model;

  model = this.subject();
  store = this.store();

  run(function() {
    package1 = store.createRecord("package", { id: 1, availableQuantity: 2 });
    image1 = store.createRecord("image", {
      id: 1,
      favourite: true,
      package: package1
    });
    image2 = store.createRecord("image", {
      id: 2,
      favourite: false,
      package: package1
    });
  });

  assert.equal(package1.get("otherImages").get("length"), 1);
  assert.equal(compare(package1.get("otherImages"), [image2]), 0);
});

test("sortedImages: Returns sorted images", function(assert) {
  var package1, image1, image2, store, model;

  model = this.subject();
  store = this.store();

  run(function() {
    package1 = store.createRecord("package", { id: 1, availableQuantity: 2 });
    image1 = store.createRecord("image", {
      id: 1,
      favourite: true,
      package: package1
    });
    image2 = store.createRecord("image", {
      id: 2,
      favourite: false,
      package: package1
    });
  });

  assert.equal(package1.get("sortedImages").get("length"), 2);
  assert.equal(compare(package1.get("sortedImages"), [image1, image2]), 0);
});

test("isAvailable: Checks package is available or not", function(assert) {
  var package1 = this.subject({
    id: 1,
    availableQuantity: 1,
    isDispatched: false,
    allowWebPublish: true
  });

  assert.expect(1);

  assert.equal(package1.get("isAvailable"), 1);
});

test("isUnavailableAndDesignated: Checks is package unavailable and designated", function(assert) {
  var package1 = this.subject({
    id: 1,
    availableQuantity: 1,
    isDispatched: false,
    allowWebPublish: false
  });

  assert.expect(1);

  assert.equal(package1.get("isUnavailableAndDesignated"), true);
});
