import ImagePreview from "./image-preview";
import { getWithDefault, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import cloudinaryImage from "../mixins/cloudinary_image";
import _ from "lodash";

export default ImagePreview.extend(cloudinaryImage, {
  store: service(),

  initializeLightgallery() {
    var gallery = $(`#lightGallery${this.get("item.id")}`).data("lightGallery");
    if (gallery) {
      gallery.destroy();
    }

    var lightGalleryObj = $(`#lightGallery${this.get("item.id")}`).lightGallery(
      {
        mode: "lg-slide",
        zoom: true,
        download: false,
        scale: 1,
        hideControlOnEnd: true,
        closable: true,
        loop: true,
        counter: true,
        enableTouch: true,
        enableDrag: true,
        selector: ".imageZoom"
      }
    );
    this.set("lightGalleryObj", lightGalleryObj);
  },

  packageType: computed("item", function() {
    const pkgType = this.get("store").peekRecord(
      "package_type",
      this.get("item").attributes.package_type_id
    );

    return getWithDefault(pkgType, "name");
  }),

  description: computed(
    "item.id",
    "i18n.locale",
    "item.attributes.notes_zh_tw",
    "item.attributes.notes",
    function() {
      const lang = this.get("i18n.locale");
      const chineseDescription = (
        this.get("item").attributes.notes_zh_tw || ""
      ).trim();

      if (lang === "zh-tw" && !!chineseDescription) {
        return chineseDescription;
      }

      return this.get("item").attributes.notes;
    }
  ),

  condition: computed(
    "item.id",
    "item.attributes.donor_condition_id",
    function() {
      const condition = this.get("store").peekRecord(
        "donor_condition",
        this.get("item").attributes.donor_condition_id
      );
      return getWithDefault(condition, "name");
    }
  ),

  dimension: computed("item", "item.id", function() {
    let length = _.get(this.get("item"), "attributes.length");
    let width = this.get("item").attributes.width;
    let height = this.get("item").attributes.height;

    if (!!length && !!width && !!height) {
      return `L ${length} X W ${width} X H ${height} cm`;
    } else {
      return false;
    }
  }),

  itemImages: computed(function() {
    return _.reduce(
      this.get("item").images,
      (results, item) => {
        let cloudinaryId = item.attributes.cloudinary_id || "";
        this.set("cloudinaryId", cloudinaryId);
        item.imageUrl = this.generateUrl(500, 500, true);
        results.push(item);
        return results;
      },
      []
    );
  })
});
