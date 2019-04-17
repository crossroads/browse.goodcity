import Ember from "ember";

export default Ember.Component.extend({
  // didDestroyElement() {
  //   let liquidContainer = Ember.$(".liquid-container");
  //   if (liquidContainer) {
  //     liquidContainer.css({
  //       position: "relative",
  //       "-webkit-transform": "translateY(0)",
  //       "-moz-transform": "translateY(0)",
  //       transform: "translateY(0)"
  //     });
  //   }
  // },

  // didRender() {
  //   let liquidContainer = Ember.$(".liquid-container");
  //   if (liquidContainer) {
  //     liquidContainer.css({
  //       position: "unset",
  //       "-webkit-transform": "unset",
  //       "-moz-transform": "unset",
  //       transform: "unset"
  //     });
  //   }
  // },

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
