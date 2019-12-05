import Ember from "ember";

export default Ember.Component.extend({
  actions: {
    goToLink: function(selector) {
      $("html, body").animate(
        {
          scrollTop: $(selector).offset().top
        },
        this.get("scrollDuration")
      );
    }
  }
});
