import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import Component from "@ember/component";

export default Component.extend({
  screenresize: service(),

  isSmallScreen: alias("screenresize.isSmallScreen"),
  isMediumScreen: alias("screenresize.isMediumScreen"),

  onScreenResized() {
    throw "Method not implemented";
  },

  init: function() {
    this._super(...arguments);
    this.__updateScreen = () => {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }
      this.onScreenResized();
    };
    window.addEventListener("resize", this.__updateScreen);
  },

  willDestroyElement() {
    this._super(...arguments);
    window.removeEventListener("resize", this.__updateScreen);
  }
});
