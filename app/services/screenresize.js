import Ember from "ember";
import "../computed/local-storage";

const MEDIA_QUERIES = {
  SMALL: Foundation.media_queries.small,
  MEDIUM: Foundation.media_queries.medium,
  LARGE: Foundation.media_queries.large
};

export default Ember.Service.extend({
  init() {
    this._super(...arguments);
    window.addEventListener("resize", () => {
      this.notifyPropertyChange("isSmallScreen");
      this.notifyPropertyChange("isMediumScreen");
    });
  },

  isSmallScreen: Ember.computed(function() {
    return (
      matchMedia(MEDIA_QUERIES.SMALL).matches &&
      !matchMedia(MEDIA_QUERIES.MEDIUM).matches
    );
  }),

  isMediumScreen: Ember.computed(function() {
    return (
      matchMedia(MEDIA_QUERIES.SMALL).matches &&
      matchMedia(MEDIA_QUERIES.MEDIUM).matches &&
      !matchMedia(MEDIA_QUERIES.LARGE).matches
    );
  }),

  isWideScreen: Ember.computed(function() {
    return (
      matchMedia(MEDIA_QUERIES.MEDIUM).matches ||
      matchMedia(MEDIA_QUERIES.LARGE).matches
    );
  })
});
