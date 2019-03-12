import { test, moduleFor } from "ember-qunit";
import startApp from "../helpers/start-app";
import TestHelper from "ember-data-factory-guy/factory-guy-test-helper";
import Ember from "ember";
import FactoryGuy from "ember-data-factory-guy";
import "../factories/package_category";

var App, pkgCategory;

moduleFor("controller:browse", "browse controller", {
  beforeEach: function() {
    App = startApp({}, 2);
    TestHelper.setup();
    pkgCategory = FactoryGuy.make("parent_package_category");
  },
  afterEach: function() {
    Ember.run(function() {
      TestHelper.teardown();
    });
    Ember.run(App, "destroy");
  }
});

test("Checking for default set values", function(assert) {
  assert.expect(2);

  // get the controller instance
  var ctrl = this.subject();

  assert.equal(ctrl.get("showCartDetailSidebar"), false);
  assert.equal(ctrl.get("packageCategoryReloaded"), false);
});

test("parentCategories computed property returns filtered PackageCategory", function(assert) {
  assert.expect(1);

  // get the controller instance
  var ctrl = this.subject();
  ctrl.set("model", [pkgCategory]);

  assert.equal(ctrl.get("parentCategories.firstObject"), pkgCategory);
});
