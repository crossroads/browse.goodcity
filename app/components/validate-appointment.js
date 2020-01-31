import $ from "jquery";
import { scheduleOnce, later } from "@ember/runloop";
import Component from "@ember/component";

export default Component.extend({
  didInsertElement() {
    this._super();

    scheduleOnce("afterRender", this, function() {
      validateInputs();
      validateForm();
      validateCheckCheckBoxInput();
    });

    function validateForm() {
      $(".appointment").click(function() {
        if (this.id === "discard-button") {
          return;
        }
        $.each([".pickadate"], function(i, input) {
          checkInput($(input));
        });
        checkCheckBoxInput($(".checkbox input")[0]);

        if ($(".form__control--error").length > 0) {
          return false;
        }
      });
    }

    function validateInputs() {
      $(".pickadate").focusout(function() {
        later(function() {
          return checkInput(this);
        }, 100);
      });

      $(".pickadate").focus(function() {
        return removeHighlight(this);
      });
    }

    function validateCheckCheckBoxInput() {
      $(".checkbox input").click(function() {
        return checkCheckBoxInput(this);
      });
    }

    function checkInput(element) {
      var parent = $(element).parent();
      var value = $(element).val();

      if (value === undefined || value.length === 0) {
        parent.addClass("form__control--error");
      } else {
        parent.removeClass("form__control--error");
      }
    }

    function checkCheckBoxInput(element) {
      var parent = $(element).parent();
      if (!($(element).context.checked || element.checked)) {
        parent.addClass("form__control--error");
      } else {
        parent.removeClass("form__control--error");
      }
    }

    function removeHighlight(element) {
      var parent = $(element).parent();
      parent.removeClass("form__control--error");
    }
  }
});
