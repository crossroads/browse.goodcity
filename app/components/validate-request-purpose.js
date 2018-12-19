import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement() {
    this._super();
    let elementArray = JSON.parse(this.get('elementArray'));

    Ember.run.scheduleOnce('afterRender', this, function(){
      validateInputs();
      validateForm();
    });

    function validateInputs(){
      elementArray.forEach(selector => {
        Ember.$(selector).focusout(function(){
          return checkInput(this);
        });
      });

      elementArray.forEach(selector => {
        Ember.$(selector).focus(function(){
          return removeHighlight(this);
        });
      });
    }

    function checkInput(element){
      var parent = Ember.$(element).parent();
      var value = Ember.$(element).val();

      if(value === undefined || value.length === 0 || value === "") {
        parent.addClass('form__control--error');
      } else {
        parent.removeClass('form__control--error');
      }
    }

    function removeHighlight(element){
      var parent = Ember.$(element).parent();
      parent.removeClass('form__control--error');
    }

    function validateForm(){
      Ember.$('#request-submit').click(function(){
        elementArray.forEach(selector => {
          return checkInput(selector);
        });
        if(Ember.$('.form__control--error').length > 0) { return false; }
      });
    }

  }
});
