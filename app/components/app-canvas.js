import Ember from "ember";
import ObserveScreenResize from "./observe-screen-resize";

export default ObserveScreenResize.extend({
  cartscroll: Ember.inject.service(),

  observeScreen: function() {
    this.get("cartscroll").resize();

    if (!this.screenResized()) {
      Ember.$(".off-canvas-wrap")
        .addClass("move-right")
        .addClass("move-left");
      Ember.$(".left-off-canvas-toggle").hide();
      this.OtherScreenOffCanvas();
    } else {
      Ember.$(".off-canvas-wrap")
        .removeClass("move-right")
        .removeClass("move-left");
      Ember.$(".left-off-canvas-toggle").show();
      this.smallScreenOffCanvas();
    }
  },
  smallScreenOffCanvas: function() {
    Ember.$(document).foundation({ offcanvas: { close_on_click: true } });
  },
  OtherScreenOffCanvas: function() {
    Ember.$(document).foundation({ offcanvas: { close_on_click: false } });
  },

  didInsertElement() {
    this.get("cartscroll").resize();
    if (!this.screenResized()) {
      this.OtherScreenOffCanvas();
    } else {
      this.smallScreenOffCanvas();
      Ember.$(".off-canvas-wrap")
        .removeClass("move-right")
        .removeClass("move-left");
    }
  }
});
