import { run } from "@ember/runloop";
import { get } from "@ember/object";
import { test, moduleForModel } from "ember-qunit";

moduleForModel("user", "user model", {
  needs: [
    "model:role",
    "model:organisation",
    "model:address",
    "model:organisations-user",
    "model:user-role"
  ]
});

test("check attributes", function(assert) {
  var model = this.subject();
  var firstName = Object.keys(model.toJSON()).indexOf("firstName") > -1;
  var lastName = Object.keys(model.toJSON()).indexOf("lastName") > -1;
  var createdAt = Object.keys(model.toJSON()).indexOf("createdAt") > -1;
  var mobile = Object.keys(model.toJSON()).indexOf("mobile") > -1;

  assert.ok(firstName);
  assert.ok(lastName);
  assert.ok(createdAt);
  assert.ok(mobile);
});

test("Relationships with other models", function(assert) {
  assert.expect(2);

  var user = this.store().modelFor("user");
  var relationshipsWithOrganisation = get(user, "relationshipsByName").get(
    "organisations"
  );

  assert.equal(relationshipsWithOrganisation.key, "organisations");
  assert.equal(relationshipsWithOrganisation.kind, "hasMany");
});

test("check mobileWithoutCountryCode computedProperty", function(assert) {
  assert.expect(1);
  var model = this.subject();

  assert.equal(model.get("mobileWithoutCountryCode"), "");
});

test("check fullName computedProperty", function(assert) {
  assert.expect(1);
  var model = this.subject();
  run(function() {
    model.set("title", "Mr");
    model.set("firstName", "David");
    model.set("lastName", "Dara");
  });

  assert.equal(model.get("fullName"), "Mr David Dara");
});
