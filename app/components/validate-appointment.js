import Ember from 'ember';

export default Ember.Component.extend({
  didInsertElement() {
    this._super();

    Ember.run.scheduleOnce('afterRender', this, function(){
      validateInputs();
      validateForm();
      validateCheckCheckBoxInput();
    });

    function validateForm(){
      Ember.$('.appointment').click(function(){
        Ember.$.each(['.pickadate'], function(i, input){
          checkInput(Ember.$(input));
        });

        checkCheckBoxInput(Ember.$('.checkbox input')[0]);

        if(Ember.$('.form__control--error').length > 0) { return false; }
      });
    }

    function validateInputs(){
      Ember.$('.pickadate').focusout(function(){
        Ember.run.later(function(){
          return checkInput(this);
        }, 100);
      });

      Ember.$('.pickadate').focus(function(){
        return removeHighlight(this);
      });   
    }

    function validateCheckCheckBoxInput(){
      Ember.$('.checkbox input').click(function(){
        return checkCheckBoxInput(this);
      });
    }

    function checkInput(element){
      var parent = Ember.$(element).parent();
      var value = Ember.$(element).val();

      if(value === undefined || value.length === 0) {
        parent.addClass('form__control--error');
      } else {
        parent.removeClass('form__control--error');
      }
    }

    function checkCheckBoxInput(element){
      var parent = Ember.$(element).parent();
      if (!( Ember.$(element).context.checked || element.checked)){
        parent.addClass('form__control--error');
      } else {
        parent.removeClass('form__control--error');
      }
    }

    function removeHighlight(element){
      var parent = Ember.$(element).parent();
      parent.removeClass('form__control--error');
    }
  }
});