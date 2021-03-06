import { compare } from "@ember/utils";
import { run } from "@ember/runloop";
import { get } from "@ember/object";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("item", {
  needs: [
    "model:package",
    "model:image",
    "model:donor-condition",
    "model:package-type",
    "model:package-category"
  ]
});

test("packages relationship", function(assert) {
  var Item = this.subject().store.modelFor("item");
  var relationship = get(Item, "relationshipsByName").get("packages");

  assert.equal(relationship.key, "packages");
  assert.equal(relationship.kind, "hasMany");
});

test("donor_condition relationship", function(assert) {
  var Item = this.subject().store.modelFor("item");
  var relationship = get(Item, "relationshipsByName").get("donorCondition");

  assert.equal(relationship.key, "donorCondition");
  assert.equal(relationship.kind, "belongsTo");
});

test("packageType relationship", function(assert) {
  var Item = this.subject().store.modelFor("item");
  var relationship = get(Item, "relationshipsByName").get("packageType");

  assert.equal(relationship.key, "packageType");
  assert.equal(relationship.kind, "belongsTo");
});

test("Valid ember-data Model", function(assert) {
  var record;
  var subject = this.subject();

  run(function() {
    subject.store.createRecord("item", { id: 1, donorDescription: "Test" });
    record = subject.store.peekRecord("item", 1);
  });

  assert.equal(record.get("donorDescription"), "Test");
});

test("allPackageCategories", function(assert) {
  var record, pkgType, pkgCategory;
  var subject = this.subject();

  run(function() {
    pkgType = subject.store.createRecord("package_type", {
      id: 5,
      code: "ABC"
    });

    record = subject.store.createRecord("item", {
      id: 5,
      packageType: pkgType
    });

    pkgCategory = subject.store.createRecord("package_category", {
      id: 5,
      packageTypeCodes: "ABC"
    });
  });

  assert.equal(record.get("allPackageCategories.firstObject.id"), [
    pkgCategory.id
  ]);
});

test("isItem: returns true if model is item", function(assert) {
  var record, pkgType;
  var subject = this.subject();
  assert.expect(1);

  run(function() {
    pkgType = subject.store.createRecord("package_type", {
      id: 5,
      code: "ABC"
    });

    record = subject.store.createRecord("item", {
      id: 5,
      packageType: pkgType
    });
  });

  assert.equal(record.get("isItem"), true);
});

test("isAvailable: returns true if all packages are available", function(assert) {
  assert.expect(1);
  var package1, package2;

  var model = this.subject();
  var store = this.store();

  run(function() {
    package1 = store.createRecord("package", {
      id: 1,
      availableQuantity: 2,
      isAvailable: true
    });
    package2 = store.createRecord("package", {
      id: 2,
      availableQuantity: 2,
      isAvailable: true
    });
    model.get("packages").pushObjects([package1, package2]);
  });

  assert.equal(model.get("isAvailable"), true);
});

test("availableQuantity: returns total availableQuantity of all packages", function(assert) {
  assert.expect(1);
  var package1, package2;

  var model = this.subject();
  var store = this.store();

  run(function() {
    package1 = store.createRecord("package", { id: 1, availableQuantity: 2 });
    package2 = store.createRecord("package", { id: 2, availableQuantity: 2 });
    model.get("packages").pushObjects([package1, package2]);
  });

  var totalQty =
    package1.get("availableQuantity") + package2.get("availableQuantity");
  assert.equal(model.get("availableQuantity"), totalQty);
});

test("isUnavailableAndDesignated: returns true if all packages are unavailable and designated", function(assert) {
  assert.expect(1);
  var package1, package2;

  var model = this.subject();
  var store = this.store();

  run(function() {
    package1 = store.createRecord("package", {
      id: 1,
      availableQuantity: 2,
      isUnavailableAndDesignated: true
    });
    package2 = store.createRecord("package", {
      id: 2,
      availableQuantity: 2,
      isUnavailableAndDesignated: true
    });
    model.get("packages").pushObjects([package1, package2]);
  });

  assert.equal(model.get("isUnavailableAndDesignated"), true);
});

test("isUnavailableAndDesignated: returns false if all packages are not unavailable and designated", function(assert) {
  assert.expect(1);
  var package1, package2;

  var model = this.subject();
  var store = this.store();

  run(function() {
    package1 = store.createRecord("package", {
      id: 1,
      availableQuantity: 2,
      isUnavailableAndDesignated: true
    });
    package2 = store.createRecord("package", {
      id: 2,
      availableQuantity: 2,
      isUnavailableAndDesignated: false
    });
    model.get("packages").pushObjects([package1, package2]);
  });

  assert.equal(model.get("isUnavailableAndDesignated"), false);
});

test("images: returns blank array if associated package do not have any image", function(assert) {
  assert.expect(2);
  var package1;

  var model = this.subject();
  var store = this.store();

  run(function() {
    package1 = store.createRecord("package", {
      id: 1,
      availableQuantity: 2,
      isUnavailableAndDesignated: true
    });
    model.get("packages").pushObjects([package1]);
  });

  assert.equal(model.get("images").get("length"), 0);
  assert.equal(compare(model.get("images"), []), 0);
});

test("favouriteImage: Returns first fav image", function(assert) {
  var image, package1, model, store, item;

  model = this.subject();
  store = this.store();

  run(function() {
    item = store.createRecord("item", { id: 1, saleable: true });
    package1 = store.createRecord("package", { id: 1, availableQuantity: 2 });
    model.get("packages").pushObjects([package1]);
    image = store.createRecord("image", {
      id: 1,
      favourite: true,
      package: package1
    });
  });

  assert.equal(model.get("favouriteImage.id"), image.get("id"));
});

test("displayImage: Returns image to be dispayed", function(assert) {
  var image, package1, model, store, item;

  model = this.subject();
  store = this.store();

  run(function() {
    item = store.createRecord("item", { id: 1, saleable: true });
    package1 = store.createRecord("package", { id: 1, availableQuantity: 2 });
    model.get("packages").pushObjects([package1]);
    image = store.createRecord("image", {
      id: 1,
      favourite: true,
      package: package1
    });
  });

  assert.equal(model.get("displayImage.id"), image.get("id"));
});
