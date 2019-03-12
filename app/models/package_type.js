import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { hasMany } from "ember-data/relationships";

export default Model.extend({
  name: attr("string"),
  code: attr("string"),
  allowRequests: attr("boolean"),
  items: hasMany("item", { async: false }),
  packages: hasMany("package", { async: false }),

  getItemPackageList: Ember.computed(
    "packages.@each.allowWebPublish",
    "_packages.@each.packageType",
    "packages.@each.hasSiblingPackages",
    "packages.@each.isAvailable",
    function() {
      var packages = this.get("packages").filterBy("isAvailable");
      var items = [];

      if (packages.length) {
        var singlePackages = packages.rejectBy("hasSiblingPackages") || [];
        items = items.concat(singlePackages.toArray());

        var multiPackages = packages.filterBy("hasSiblingPackages") || [];
        items = items.concat(multiPackages.map(pkg => pkg.get("item")).uniq());
      }
      return items.uniq();
    }
  ),

  _packages: Ember.computed("packages.[]", function() {
    return this.get("store").peekAll("package");
  }),

  _packageCategories: Ember.computed(function() {
    return this.store.peekAll("package_category");
  }),

  packageCategories: Ember.computed(
    "code",
    "_packageCategories.[]",
    function() {
      return this.get("_packageCategories").filter(
        p =>
          p.get("packageTypeCodes") &&
          p.get("packageTypeCodes").indexOf(this.get("code")) > -1
      );
    }
  ),

  allPackageCategories: Ember.computed(
    "code",
    "_packageCategories.[]",
    function() {
      var categories = this.get("packageCategories").toArray();
      this.get("packageCategories").forEach(function(pkg) {
        var parentCategory = pkg.get("parentCategory");
        if (parentCategory) {
          categories = categories.concat(parentCategory);
        }
      });
      return categories.uniq();
    }
  )
});
