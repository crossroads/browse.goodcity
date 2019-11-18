import $ from "jquery";
import Service from "@ember/service";

export default Service.extend({
  resize() {
    $(".item-collection").height(
      $(".cart-items").height() - $(".cart-controls").height()
    );
  }
});
