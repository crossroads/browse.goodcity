import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo, hasMany } from "ember-data/relationships";
import cloudinaryImage from "../mixins/cloudinary_image";
const { getOwner } = Ember;

export default Model.extend(cloudinaryImage, {
  donorDescription: attr("string"),
  createdAt: attr("date"),
  updatedAt: attr("date"),

  packages: hasMany("package", { async: false }),
  packageType: belongsTo("package_type", { async: false }),
  donorCondition: belongsTo("donor_condition", { async: false }),
  saleable: attr("boolean"),

  quantity: Ember.computed("packages.@each.quantity", function() {
    let totalQuantity = 0;
    this.get("packages").forEach(function(pkg) {
      totalQuantity = totalQuantity + pkg.get("quantity");
    });
    return totalQuantity;
  }),

  isAvailable: Ember.computed("packages.@each.isAvailable", function() {
    return this.get("packages").filterBy("isAvailable").length > 0;
  }),

  isUnavailableAndDesignated: Ember.computed(
    "packages.@each.isUnavailableAndDesignated",
    function() {
      return (
        this.get("packages").filterBy("isUnavailableAndDesignated").length ===
        this.get("packages").length
      );
    }
  ),

  images: Ember.computed("packages.@each.images.[]", function() {
    var images = [];
    this.get("packages").forEach(function(pkg) {
      var pkgImages = pkg.get("images") ? pkg.get("images").toArray() : [];
      images = images.concat(pkgImages);
    });
    return images;
  }),

  isItem: Ember.computed("this", function() {
    return this.get("constructor.modelName") === "item";
  }),

  favouriteImage: Ember.computed("images.@each.favourite", function() {
    return this.get("images")
      .filterBy("favourite")
      .get("firstObject");
  }),

  otherImages: Ember.computed("images.[]", function() {
    var images = this.get("images").filter(
      (image, index, self) =>
        self.findIndex(
          t => t.get("cloudinaryId") === image.get("cloudinaryId")
        ) === index
    );
    return images.removeObject(this.get("favouriteImage"));
  }),

  sortedImages: Ember.computed("otherImages.[]", "image", function() {
    var images = this.get("otherImages").toArray();
    images.unshift(this.get("favouriteImage"));
    return images;
  }),

  displayImage: Ember.computed("images.@each.favourite", function() {
    return (
      this.get("favouriteImage") ||
      this.get("images")
        .sortBy("id")
        .get("firstObject") ||
      null
    );
  }),

  displayImageUrl: Ember.computed("displayImage", function() {
    return (
      this.get("displayImage.defaultImageUrl") ||
      this.generateUrl(500, 500, true)
    );
  }),

  previewImageUrl: Ember.computed("displayImage", function() {
    return (
      this.get("displayImage.previewImageUrl") ||
      this.generateUrl(265, 265, true)
    );
  }),

  allPackageCategories: Ember.computed.alias(
    "packageType.allPackageCategories"
  ),

  undispatchedPackages: Ember.computed(
    "packages.@each.stockitSentOn",
    function() {
      return this.get("packages").filter(pkg => pkg.get("stockitSentOn"));
    }
  )
});
