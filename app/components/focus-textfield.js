import Ember from "ember";

export default Ember.TextField.extend({
  tagName: "input",
  type:    "text",
  maxlength: "25",
  attributeBindings: [ "name", "id", "value", 'placeholder'],
  cordova: Ember.inject.service(),
  store: Ember.inject.service(),

  triggerAutofocus: Ember.observer("value", function() {
    if (this.get('value').length === 0) {
      this.$().focus();
    }
  }),

  scrollToStart() {
    Ember.$(".fixed_search_header").addClass("absolute");
    Ember.$(".footer").addClass("absolute_footer");
    Ember.$(".search").addClass("no-padding");

    document.body.scrollTop = document.documentElement.scrollTop = 0;
  },

  focusOut(){
    if(this.get("hasFixedInputHeader")) {
      Ember.$(".fixed_search_header").removeClass("absolute");
      Ember.$(".footer").removeClass("absolute_footer");
      Ember.$(".search").removeClass("no-padding");
    }
  },

  willDestroyElement() {
    if(this.get("hasFixedInputHeader")) {
      this.element.addEventListener('touchstart', this.scrollToStart);
    }
  }
});
