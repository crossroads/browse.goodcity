import $ from "jquery";
import { observer } from "@ember/object";
import TextArea from "@ember/component/text-area";

export default TextArea.extend({
  tagName: "textarea",

  attributeBindings: [
    "data-autoresize",
    "value",
    "name",
    "id",
    "placeholder",
    "maxlength",
    "required",
    "pattern"
  ],

  valueChanged: observer("value", function() {
    this.setTextareaHeight();
  }),

  didInsertElement() {
    this.setTextareaHeight();
  },

  setTextareaHeight: function() {
    var textarea = this.element;
    var offset = textarea.offsetHeight - textarea.clientHeight;

    if (this.get("value") && this.get("value").length === 0) {
      $(textarea).css("height", "auto");
    } else if (textarea.scrollHeight < 120) {
      $(textarea)
        .css("height", "auto")
        .css("height", textarea.scrollHeight + offset)
        .removeAttr("data-autoresize");
    } else {
      $(textarea)
        .css({ height: "auto", "overflow-y": "auto" })
        .height(105);
    }
  }
});
