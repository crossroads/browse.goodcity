import $ from "jquery";
import { getOwner } from "@ember/application";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import ObserveScreenResize from "./observe-screen-resize";

export default ObserveScreenResize.extend({
  cartscroll: service(),
  application: computed(function() {
    return getOwner(this).lookup("controller:application");
  }),

  isHomePage: computed(function() {
    return this.get("application.isHomePage");
  }).volatile(),

  onScreenResized() {
    if (this.get("isSmallScreen")) {
      $(".left-off-canvas-toggle").show();
      this.closeSideBars();
      this.applySmallScreenSettings();
    } else {
      $(".left-off-canvas-toggle").hide();
      if (this.get("application.showOffCanvas")) {
        this.showSideBar();
      }
      this.applyDesktopScreenSettings();
    }
    this.get("cartscroll").resize();
  },

  closeSideBars() {
    $(".off-canvas-wrap")
      .removeClass("move-right")
      .removeClass("move-left");
  },

  showSideBar() {
    $(".off-canvas-wrap").addClass("move-right");
  },

  applySmallScreenSettings: function() {
    $(document).foundation({ offcanvas: { close_on_click: true } });
  },

  applyDesktopScreenSettings: function() {
    $(document).foundation({ offcanvas: { close_on_click: false } });
  },

  didInsertElement() {
    this.onScreenResized();
  }
});
