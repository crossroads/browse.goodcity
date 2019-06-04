import Ember from "ember";

export default Ember.Component.extend({
  screenresize: Ember.inject.service(),

  isSmallScreen: Ember.computed.alias("screenresize.isSmallScreen"),
  isMediumScreen: Ember.computed.alias("screenresize.isMediumScreen"),

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
