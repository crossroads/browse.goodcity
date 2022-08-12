import $ from "jquery";
import { computed } from "@ember/object";
import { equal, notEmpty } from "@ember/object/computed";
import Model from "ember-data/model";
import attr from "ember-data/attr";

export default Model.extend({
  parentId: attr("number"),
  name: attr("string"),
  packageTypeCodes: attr("string"),

  isParent: equal("parentId", null),
  isChild: notEmpty("parentId"),
  reloadPackageCategory: false,

  parentCategory: computed("parentId", "reloadPackageCategory", function() {
    return this.get("parentId")
      ? this.store.peekRecord("package_category", this.get("parentId"))
      : null;
  }),

  nameWithCount: computed(
    "name",
    "packagesAndSets.length",
    "reloadPackageCategory",
    function() {
      return this.get("name") + " (" + this.get("packagesAndSets.length") + ")";
    }
  ),

  childCategories: computed(
    "allChildCategories",
    "reloadPackageCategory",
    function() {
      return this.get("allChildCategories").rejectBy("items.length", 0);
    }
  ),

  allChildCategories: computed(
    "_packageCategories.[]",
    "reloadPackageCategory",
    function() {
      return this.get("_packageCategories").filterBy(
        "parentId",
        parseInt(this.get("id"), 10)
      );
    }
  ),

  _packageCategories: computed(function() {
    return this.store.peekAll("package_category");
  }),

  packagesAndSets: computed(
    "reloadPackageCategory",
    "packageTypeCodes",
    "packageTypes.@each.packagesAndSets",
    "childCategories.@each.content.[]",
    function() {
      const children = this.get("isParent")
        ? this.get("childCategories")
        : this.get("packageTypes");

      return (children || [])
        .reduce((res, child) => {
          return [...res, ...(child.get("packagesAndSets") || []).toArray()];
        }, [])
        .uniq();
    }
  ),

  _packageTypes: computed(function() {
    return this.store.peekAll("package_type");
  }),

  packageTypes: computed(
    "reloadPackageCategory",
    "packageTypeCodes",
    "_packageTypes.[]",
    function() {
      if (this.get("packageTypeCodes.length") > 0) {
        var list = this.get("packageTypeCodes").split(",");
        return this.get("_packageTypes").filter(
          p => list.indexOf(p.get("code")) > -1
        );
      }
      return [];
    }
  ),

  imageUrl: computed(function() {
    if (this.get("isParent")) {
      var images = {
        "8": "1436965082/browse/browse_image_2.png",
        "1": "1436965083/browse/browse_image_3.png",
        "19": "1660276066/browse/cutlery.png",
        "25": "1660276066/browse/handmade.png",
        "36": "1436965083/browse/browse_image_6.png"
      };
      var id = images[this.get("id")];
      if (id) {
        var version = id.split("/")[0];
        var filename = id.substring(id.indexOf("/") + 1);
        return $.cloudinary.url(filename, {
          version: version,
          height: 100,
          width: 100,
          crop: "fill",
          flags: "progressive",
          id: id,
          secure: true,
          protocol: "https:",
          radius: "max"
        });
      }
    }
  })
});
