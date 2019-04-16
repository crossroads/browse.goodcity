import Ember from "ember";

export default Ember.Component.extend({
  didInsertElement() {
    this._super();

    Ember.run.scheduleOnce("afterRender", this, function() {
      var offset = 300;
      var duration = 300;

      Ember.$(".sticky_title_bar").on("click", ".back", function() {
        window.scrollTo(0, 0);
      });

      Ember.$(window).scroll(function() {
        if (Ember.$(this).scrollTop() > offset) {
          Ember.$(".back-to-top").fadeIn(duration);
        } else {
          Ember.$(".back-to-top").fadeOut(duration);
        }
      });

      Ember.$(".back-to-top").click(function() {
        Ember.$("html, body").animate(
          {
            scrollTop: 0
          },
          duration
        );
        return false;
      });
    });
  }
});
