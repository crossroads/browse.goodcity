import $ from "jquery";
import ObserveScreenResize from "./observe-screen-resize";

export default ObserveScreenResize.extend({
  lightGalleryObj: null,

  onScreenResized() {
    this.initializeLightgallery();
  },

  initializeLightgallery() {
    var gallery = $("#lightGallery").data("lightGallery");
    if (gallery) {
      gallery.destroy();
    }

    var lightGalleryObj = $("#lightGallery").lightGallery({
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
    });
    this.set("lightGalleryObj", lightGalleryObj);
  },

  didInsertElement() {
    this.initializeLightgallery();
  },

  willDestroyElement() {
    var gallery = $("#lightGallery").data("lightGallery");
    if (gallery) {
      gallery.destroy();
    }
  }
});
