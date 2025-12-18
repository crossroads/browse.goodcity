import { computed } from "@ember/object";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { hasMany } from "ember-data/relationships";

export default Model.extend({
  name: attr("string"),
  code: attr("string"),
  allowRequests: attr("boolean"),
  package_sets: hasMany("package_set", { async: false }),
  packages: hasMany("package", { async: false }),

  packagesAndSets: computed(
    "packages.@each.allowWebPublish",
    "_packages.@each.packageType",
    "packages.@each.hasSiblingPackages",
    "packages.@each.isAvailable",
    "packages.@each.packageCategoryOverride",
    function() {
      var packages = this.get("packages").filterBy("isAvailable");
      var records = [];

      if (packages.length) {
        var singlePackages = packages.rejectBy("hasSiblingPackages") || [];
        records = records.concat(singlePackages.toArray());

        var multiPackages = packages.filterBy("hasSiblingPackages") || [];
        records = records.concat(
          multiPackages.map(pkg => pkg.get("packageSet")).uniq()
        );
      }
      return records.uniq();
    }
  ),

  _packages: computed("packages.[]", function() {
    return this.get("store").peekAll("package");
  }),

  _packageCategories: computed(function() {
    return this.store.peekAll("package_category");
  }),

  packageCategories: computed("code", "_packageCategories.[]", function() {
    return this.get("_packageCategories").filter(
      p =>
        p.get("packageTypeCodes") &&
        p.get("packageTypeCodes").indexOf(this.get("code")) > -1
    );
  }),

  allPackageCategories: computed("code", "_packageCategories.[]", function() {
    var categories = this.get("packageCategories").toArray();
    this.get("packageCategories").forEach(function(pkg) {
      var parentCategory = pkg.get("parentCategory");
      if (parentCategory) {
        categories = categories.concat(parentCategory);
      }
    });
    return categories.uniq();
  })
});
