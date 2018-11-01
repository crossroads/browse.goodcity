import Ember from 'ember';

export default Ember.TextField.extend({
  tagName: 'input',
  classNames: 'pickadate',
  attributeBindings: [ "name", "type", "value", "id", 'required', 'pattern', 'placeholder'],

  currentMinutes: function(){
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes() > 30 ? 30 : 0;
    var total_mins = hours*60 + minutes;
    return (total_mins > 900) ? 900 : total_mins;
  },

  _currentDay: function(){
    var currentDate = new Date();
    currentDate.setHours(0,0,0,0);
    return currentDate;
  },

  _getValidDate: function(selectedDate){
    var today = new Date();
    var currentDate = new Date();
    var selected = selectedDate;
    currentDate.setHours(0,0,0,0);
    selected.setHours(0,0,0,0);
    return currentDate > selected ? today : selectedDate;
  },

  _setTimeSlots: function(date){
    var selectedDate = date;
    var currentDate = new Date();
    currentDate.setHours(0,0,0,0);
    selectedDate.setHours(0,0,0,0);

    if(selectedDate.getTime() === currentDate.getTime()) {
      var total_mins = this.currentMinutes();

      // disabled all previous options
      Ember.$(".time_selector select option[value="+total_mins+"]").prevAll().each(function() {
          Ember.$( this ).addClass("hidden");
          this.disabled = true;
      });

      // disable current option
      var current_option = Ember.$(".time_selector select option[value="+total_mins+"]");
      if(current_option.length > 0) {
        current_option.addClass("hidden");
        current_option[0].disabled = true;
      }

    } else {
      // Enable all select options
      Ember.$(".time_selector select option").each(function() {
        Ember.$( this ).removeClass("hidden");
        this.disabled = false;
      });
    }
  },

  didInsertElement() {
    var _this = this;
    var date = new Date();
    var setting = false;

    // Allow GGV booking for next 6 months span.
    var maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);


    var list = this.get('available');
    var available_count = 0, available_array = [true];

    if(list) {
      available_count = list.length;
      for (var i = available_count - 1; i >= 0; i--) {
        date = new Date(list[i]);
        var date_array = [];
        date_array.push(date.getFullYear());
        date_array.push(date.getMonth());
        date_array.push(date.getDate());
        available_array.push(date_array);
      }

      var firstDateArray = available_array.get("lastObject");
      var firstDate = new Date(firstDateArray[0], firstDateArray[1],firstDateArray[2]);
      var isTodayListed = _this._currentDay().getTime() === firstDate.getTime();
      if(_this.currentMinutes() === 900 && isTodayListed) { available_array.pop(); }
    }

    Ember.run.scheduleOnce('afterRender', this, function(){
      Ember.$('.pickadate').pickadate({
        format: 'ddd mmm d',
        monthsFull: moment.months(),
        monthsShort: moment.monthsShort(),
        weekdaysShort: moment.weekdaysShort(),
        disable: available_array,
        clear: false,
        today: false,
        close: false,
        min: available_array[available_array.length - 1],
        max: available_array[1],

        onClose: function() {
          Ember.$(document.activeElement).blur();

          if (setting) { return; }

          var date = this.get('select') && this.get('select').obj;
          _this.set("selection", date);
          Ember.$('.time_selector select').val('');
          removeHighlight(".date_selector input");

          setting = true;
          Ember.run.next(() => {
            if(date) {
              this.set('select', new Date(date), { format: 'ddd mmm d' });
            }
            setting = false;
          });

          if(date) { _this._setTimeSlots(date); }
        },

        onStart: function(){
          var date = _this.get('selection');
          if(date) {
            date = _this._getValidDate(date);
            this.set('select', new Date(date), { format: 'ddd mmm d' });
            _this._setTimeSlots(date);
          }
        }
      });

      validateForm();
      validateInputs();
    });

    function validateForm(){
      Ember.$('.button.book_van').click(function(){
        var date = checkInput(Ember.$('.date_selector input'));
        var time = checkInput(Ember.$('.time_selector select'));
        return date && time;
      });
    }

    function validateInputs(){
      Ember.$('.date_selector input').focus(function(){
        return removeHighlight(this);
      });
      Ember.$('.time_selector select').focus(function(){
        return removeHighlight(this);
      });
    }

    function checkInput(element){
      var parent = Ember.$(element).parent();
      var value = Ember.$(element).val();

      if(!value || value.length === 0) {
        parent.addClass('has-error');
        return false;
      } else {
        parent.removeClass('has-error');
        return true;
      }
    }

    function removeHighlight(element){
      var parent = Ember.$(element).parent();
      parent.removeClass('has-error');
    }
  }

});
