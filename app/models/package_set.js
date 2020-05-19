import { computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { hasMany, belongsTo } from "ember-data/relationships";

/**
 * @module Models/PackageSet
 * @description A collection (or 'set') of packages, locally known as 'items'
 * @augments ember/Model
 *
 */
export default Model.extend({
  description: attr("string"),
  packageIds: attr(),
  packageTypIeId: attr("string"),

  packageType: belongsTo("packageType", {
    async: false
  }),

  packages: hasMany("package", {
    async: false
  }),

  isSet: true,

  quantity: computed("packages.@each.availableQuantity", function() {
    return this.get("packages").reduce(function(qty, pkg) {
      return qty + pkg.get("availableQuantity");
    }, 0);
  }),

  isAvailable: computed(
    "packages.[]",
    "packages.@each.isAvailable",
    function() {
      return this.get("packages").filterBy("isAvailable").length > 0;
    }
  ),

  images: computed("packages.@each.images.[]", function() {
    var images = [];
    this.get("packages").forEach(function(pkg) {
      var pkgImages = pkg.get("images") ? pkg.get("images").toArray() : [];
      images = images.concat(pkgImages);
    });
    return images;
  }),

  favouriteImage: computed("images.@each.favourite", function() {
    return this.get("images")
      .filterBy("favourite")
      .get("firstObject");
  }),

  otherImages: computed("images.[]", function() {
    var images = this.get("images").filter(
      (image, index, self) =>
        self.findIndex(
          t => t.get("cloudinaryId") === image.get("cloudinaryId")
        ) === index
    );
    return images.removeObject(this.get("favouriteImage"));
  }),

  sortedImages: computed("otherImages.[]", "image", function() {
    var images = this.get("otherImages").toArray();
    images.unshift(this.get("favouriteImage"));
    return images;
  }),

  displayImage: computed("images.@each.favourite", function() {
    return (
      this.get("favouriteImage") ||
      this.get("images")
        .sortBy("id")
        .get("firstObject") ||
      null
    );
  }),

  displayImageUrl: computed("displayImage", function() {
    return (
      this.get("displayImage.defaultImageUrl") ||
      this.generateUrl(500, 500, true)
    );
  }),

  previewImageUrl: computed("displayImage", function() {
    return (
      this.get("displayImage.previewImageUrl") ||
      this.generateUrl(265, 265, true)
    );
  }),

  allPackageCategories: alias("packageType.allPackageCategories")
});
