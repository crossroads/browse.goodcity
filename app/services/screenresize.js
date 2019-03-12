import Ember from "ember";
import "../computed/local-storage";

export default Ember.Service.extend({
  isSmallScreen: false,
  isMediumScreen: false,

  screenResized: function() {
    return (
      matchMedia(Foundation.media_queries.small).matches &&
      !matchMedia(Foundation.media_queries.medium).matches
    );
  },

  screenResizedMedium: function() {
    return (
      matchMedia(Foundation.media_queries.small).matches &&
      matchMedia(Foundation.media_queries.medium).matches &&
      !matchMedia(Foundation.media_queries.large).matches
    );
  },

  observeScreen: function() {
    this.set("isSmallScreen", this.screenResized());
    this.set("isMediumScreen", this.screenResizedMedium());
  },

  initComponent: function() {
    this.observeScreen();
    var updateScreen = Ember.run.bind(this, this.observeScreen);
    window.addEventListener("resize", updateScreen);
  }.on("init")
});
