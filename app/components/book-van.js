import Ember from "ember";

export default Ember.Component.extend({
  didInsertElement() {
    this._super();

    Ember.run.scheduleOnce("afterRender", this, function() {
      validateInputs();
      validateForm();
    });

    function validateForm() {
      Ember.$(".book_van").click(function() {
        Ember.$.each([".pickadate", ".timepicker"], function(i, input) {
          checkInput(Ember.$(input));
        });
        if (Ember.$(".form__control--error").length > 0) {
          return false;
        }
      });
    }

    function validateInputs() {
      Ember.$(".pickadate, .timepicker").focusout(function() {
        return checkInput(this);
      });
      Ember.$(".pickadate, .timepicker").focus(function() {
        return removeHighlight(this);
      });
    }

    function checkInput(element) {
      var parent = Ember.$(element).parent();
      var value = Ember.$(element).val();

      if (value === undefined || value.length === 0) {
        parent.addClass("form__control--error");
      } else {
        parent.removeClass("form__control--error");
      }
    }

    function removeHighlight(element) {
      var parent = Ember.$(element).parent();
      parent.removeClass("form__control--error");
    }
  }
});
