import Ember from "ember";
import ObserveScreenResize from "./observe-screen-resize";

export default ObserveScreenResize.extend({
  cartscroll: Ember.inject.service(),
  application: Ember.computed(function() {
    return Ember.getOwner(this).lookup("controller:application");
  }),

  isHomePage: Ember.computed(function() {
    return this.get("application.isHomePage");
  }).volatile(),

  onScreenResized() {
    if (this.get("isSmallScreen")) {
      Ember.$(".left-off-canvas-toggle").show();
      this.closeSideBars();
      this.applySmallScreenSettings();
    } else {
      Ember.$(".left-off-canvas-toggle").hide();
      if (this.get("application.showOffCanvas")) {
        this.showSideBar();
      }
      this.applyDesktopScreenSettings();
    }
    this.get("cartscroll").resize();
  },

  closeSideBars() {
    Ember.$(".off-canvas-wrap")
      .removeClass("move-right")
      .removeClass("move-left");
  },

  showSideBar() {
    Ember.$(".off-canvas-wrap").addClass("move-right");
  },

  applySmallScreenSettings: function() {
    Ember.$(document).foundation({ offcanvas: { close_on_click: true } });
  },

  applyDesktopScreenSettings: function() {
    Ember.$(document).foundation({ offcanvas: { close_on_click: false } });
  },

  didInsertElement() {
    this.onScreenResized();
  }
});
