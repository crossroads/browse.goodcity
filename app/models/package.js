import { bool, alias } from "@ember/object/computed";
import { once } from "@ember/runloop";
import { observer, computed } from "@ember/object";
import { getOwner } from "@ember/application";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo, hasMany } from "ember-data/relationships";
import cloudinaryImage from "../mixins/cloudinary_image";

export default Model.extend(cloudinaryImage, {
  quantity: attr("number"),
  length: attr("number"),
  width: attr("number"),
  height: attr("number"),
  notes: attr("string"),
  inventoryNumber: attr("string"),

  createdAt: attr("date"),
  updatedAt: attr("date"),
  item: belongsTo("item", { async: false }),
  packageType: belongsTo("package_type", { async: false }),
  imageIds: attr(),
  images: hasMany("image", { async: false }),
  donorCondition: belongsTo("donor_condition", { async: false }),
  itemId: attr("number"),
  stockitSentOn: attr("date"),
  orderId: attr("number"),
  allowWebPublish: attr("boolean"),

  //This is fix for live update for ticket GCW-1632(only implemented on singleton packages, nee to change for qty packages)
  updateAllowwebpublishQtyIfDesignated: observer(
    "allowWebPublish",
    "quantity",
    "orderId",
    function() {
      once(this, function() {
        if (this.get("orderId")) {
          this.set("allowWebPublish", false);
        }
      });
    }
  ),

  isDispatched: bool("stockitSentOn"),

  isAvailable: computed("isDispatched", "allowWebPublish", function() {
    return Boolean(
      !this.get("isDispatched") &&
        (this.get("allowWebPublish") ||
          (this._internalModel._data &&
            this._internalModel._data.allowWebPublish)) &&
        this.get("quantity")
    );
  }),

  isUnavailableAndDesignated: computed(
    "isDispatched",
    "allowWebPublish",
    function() {
      return (
        !this.get("isDispatched") &&
        (!this.get("allowWebPublish") || this.get("orderId"))
      );
    }
  ),

  allPackageCategories: alias("packageType.allPackageCategories"),

  _packages: computed(function() {
    return this.store.peekAll("package");
  }),

  hasSiblingPackages: computed("_packages.@each.itemId", function() {
    return (
      this.get("itemId") &&
      this.get("_packages").filterBy("itemId", this.get("itemId")).length > 1
    );
  }),

  packageName: computed("packageType", function() {
    return this.get("packageType.name");
  }),

  packageTypeObject: computed("packageType", function() {
    var obj = this.get("packageType").getProperties(
      "id",
      "name",
      "isItemTypeNode"
    );
    obj.id = obj.packageTypeId = parseInt(obj.id, 10);
    return obj;
  }),

  dimensions: computed("width", "height", "length", function() {
    var res = "";
    var append = val => {
      if (val) {
        res += !res ? val : " x " + val;
      }
    };
    append(`W${this.get("width")}`);
    append(`H${this.get("height")}`);
    append(`L${this.get("length")}`);
    return !res ? "" : res + " cm";
  }),

  image: computed("images.@each.favourite", function() {
    return this.get("images")
      .filterBy("favourite")
      .get("firstObject");
  }),

  favouriteImage: alias("image"),

  otherImages: computed("images.[]", function() {
    return this.get("images")
      .toArray()
      .removeObject(this.get("image"));
  }),

  sortedImages: computed("otherImages.[]", "image", function() {
    var images = this.get("otherImages").toArray();
    images.unshift(this.get("image"));
    return images;
  }),

  displayImage: alias("image"),

  displayImageUrl: computed("image", function() {
    return (
      this.get("image.defaultImageUrl") || this.generateUrl(500, 500, true)
    );
  }),

  previewImageUrl: computed("image", function() {
    return (
      this.get("image.previewImageUrl") || this.generateUrl(265, 265, true)
    );
  })
});
