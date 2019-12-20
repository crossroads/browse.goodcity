import { scheduleOnce, next } from "@ember/runloop";
import $ from "jquery";
import TextField from "@ember/component/text-field";

export default TextField.extend({
  tagName: "input",
  classNames: "pickadate",
  attributeBindings: [
    "name",
    "type",
    "value",
    "id",
    "required",
    "pattern",
    "placeholder"
  ],

  currentMinutes: function() {
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes() > 30 ? 30 : 0;
    var total_mins = hours * 60 + minutes;
    return total_mins > 900 ? 900 : total_mins;
  },

  _currentDay: function() {
    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return currentDate;
  },

  //This prevents from showing previous date in calender in case of due date is past today's date

  // _getValidDate: function(selectedDate){
  //   var today = new Date();
  //   var currentDate = new Date();
  //   var selected = new Date(selectedDate);
  //   currentDate.setHours(0,0,0,0);
  //   selected.setHours(0,0,0,0);
  //   return currentDate > selected ? today : selectedDate;
  // },

  _setTimeSlots: function(date) {
    var selectedDate = new Date(date);
    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate.getTime() === currentDate.getTime()) {
      var total_mins = this.currentMinutes();

      // disabled all previous options
      $(".time_selector select option[value=" + total_mins + "]")
        .prevAll()
        .each(function() {
          $(this).addClass("hidden");
          this.disabled = true;
        });

      // disable current option
      var current_option = $(
        ".time_selector select option[value=" + total_mins + "]"
      );
      if (current_option.length > 0) {
        current_option.addClass("hidden");
        current_option[0].disabled = true;
      }
    } else {
      // Enable all select options
      $(".time_selector select option").each(function() {
        $(this).removeClass("hidden");
        this.disabled = false;
      });
    }
  },

  didDestroyElement() {
    let liquidContainer = $(".liquid-container");
    if (liquidContainer) {
      liquidContainer.css({
        "-webkit- transform": "translateY(0)",
        "moz-transform": "translateY(0)",
        transform: "translateY(0)"
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

    let liquidContainer = $(".liquid-container");
    if (liquidContainer) {
      liquidContainer.css({
        "-webkit-transform": "unset",
        "-moz-transform": "unset",
        transform: "unset"
      });
    }
    var list = this.get("available");
    var available_count = 0,
      available_array = [true];

    if (list) {
      available_count = list["appointment_calendar_dates"].length;
      var dates = list["appointment_calendar_dates"]
        .rejectBy("isClosed", true)
        .getEach("date");

      for (var i = dates.length - 1; i >= 0; i--) {
        date = new Date(dates[i]);
        var date_array = [];
        date_array.push(date.getFullYear());
        date_array.push(date.getMonth());
        date_array.push(date.getDate());
        available_array.push(date_array);
      }

      var firstDateArray = available_array.get("lastObject");
      var firstDate = new Date(
        firstDateArray[0],
        firstDateArray[1],
        firstDateArray[2]
      );
      var isTodayListed = _this._currentDay().getTime() === firstDate.getTime();
      if (_this.currentMinutes() === 900 && isTodayListed) {
        available_array.pop();
      }
    }

    scheduleOnce("afterRender", this, function() {
      $(".pickadate").pickadate({
        format: "ddd mmm d",
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
          $(document.activeElement).blur();

          if (setting) {
            return;
          }

          var date = this.get("select") && this.get("select").obj;
          _this.set("selection", date);
          $(".time_selector select").val("");
          removeHighlight(".date_selector input");

          setting = true;
          next(() => {
            if (date) {
              this.set("select", new Date(date), { format: "ddd mmm d" });
            }
            setting = false;
          });

          if (date) {
            _this._setTimeSlots(date);
          }
        },

        onStart: function() {
          var date = _this.get("selection");
          if (date) {
            //This prevents from showing previous date in calender in case of due date is past today's date
            // date = _this._getValidDate(date);
            this.set("select", new Date(date), { format: "ddd mmm d" });
            _this._setTimeSlots(date);
          }
        }
      });

      validateForm();
      validateInputs();
    });

    function validateForm() {
      $(".a.appointment").click(function() {
        var date = checkInput($(".date_selector input"));
        var time = checkInput($(".time_selector select"));
        return date && time;
      });
    }

    function validateInputs() {
      $(".date_selector input").focus(function() {
        return removeHighlight(this);
      });
      $(".time_selector select").focus(function() {
        return removeHighlight(this);
      });
    }

    function checkInput(element) {
      var parent = $(element).parent();
      var value = $(element).val();

      if (!value || value.length === 0) {
        parent.addClass("has-error");
        return false;
      } else {
        parent.removeClass("has-error");
        return true;
      }
    }

    function removeHighlight(element) {
      var parent = $(element).parent();
      parent.removeClass("has-error");
    }
  }
});
