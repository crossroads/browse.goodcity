import { debounce } from "@ember/runloop";
import $ from "jquery";
import Service, { inject as service } from "@ember/service";

export default Service.extend({
  i18n: service(),

  //Need to pass message to show
  show(message) {
    var element = $("#flash_message")
      .clone()
      .text(this.get("i18n").t(message));
    $(".flash_message_block").addClass("visible");
    element.prependTo(".flash_message_block");
    debounce(this, this.hideFlashMessage, 500);
  },

  hideFlashMessage() {
    $(".flash_message_block").fadeOut(3000);
    debounce(this, this.removeFlashMessage, 2500);
  },

  removeFlashMessage() {
    $(".flash_message_block").empty();
    $(".flash_message_block").addClass("visible");
  }
});
