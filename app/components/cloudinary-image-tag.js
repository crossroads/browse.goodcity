import { bind } from "@ember/runloop";
import Component from "@ember/component";

export default Component.extend({
  loading: true,

  changedSrc: function() {
    if (!this.is_cached(this.get("src"))) {
      this.set("loading", true);
    }
  }.observes("src"),

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
