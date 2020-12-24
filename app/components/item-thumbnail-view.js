import { bind } from "@ember/runloop";
import Component from "@ember/component";
import { inject as service } from "@ember/service";
import cloudinaryImage from "../mixins/cloudinary_image";

export default Component.extend(cloudinaryImage, {
  loading: true,
  store: service(),

  changedSrc: function() {
    if (!this.is_cached(this.get("src"))) {
      this.set("loading", true);
    }
  }.observes("src"),

  didReceiveAttrs() {
    this._super(...arguments);
    this.set("cloudinaryId", this.get("cloudinaryId"));
    this.set("src", this.generateUrl(500, 500, true));
    const pkgTypeType = this.get("store").peekRecord(
      "package_type",
      this.get("item").attributes.package_type_id
    );
    this.set("pkgTypeType", pkgTypeType);
  },

  onLoad: function() {
    this.set("loading", false);
  },

  is_cached: function(src) {
    var image = new Image();
    image.src = src;
    return image.complete;
  },

  didInsertElement() {
    var updateScreen = bind(this, this.onLoad);
    this.$(".cl-item-image").on("load", updateScreen);
  },

  willDestroyElement() {
    this.$(".cl-item-image").off("load");
  }
});
