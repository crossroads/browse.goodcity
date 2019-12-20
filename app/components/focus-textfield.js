import $ from "jquery";
import { observer } from "@ember/object";
import TextField from "@ember/component/text-field";

export default TextField.extend({
  tagName: "input",
  type: "text",
  maxlength: "25",
  attributeBindings: ["name", "id", "value", "placeholder"],

  triggerAutofocus: observer("value", function() {
    if (this.get("value").length === 0) {
      this.$().focus();
    }
  }),

  didInsertElement() {
    this.$().focus();
  },

  scrollToStart() {
    $(".fixed_search_header").addClass("absolute");
    $(".footer").addClass("absolute_footer");
    $(".search").addClass("no-padding");

    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },

  focusOut() {
    if (this.get("hasFixedInputHeader")) {
      $(".fixed_search_header").removeClass("absolute");
      $(".footer").removeClass("absolute_footer");
      $(".search").removeClass("no-padding");
    }
  },

  willDestroyElement() {
    if (this.get("hasFixedInputHeader")) {
      this.element.addEventListener("touchstart", this.scrollToStart);
    }
  }
});
