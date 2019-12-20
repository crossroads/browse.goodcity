import $ from "jquery";
import { scheduleOnce } from "@ember/runloop";
import Component from "@ember/component";

export default Component.extend({
  // dont remove this commented code, will need this later.
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

    scheduleOnce("afterRender", this, function() {
      var offset = 300;
      var duration = 300;

      $(".sticky_title_bar").on("click", ".back", function() {
        window.scrollTo(0, 0);
      });

      $(window).scroll(function() {
        if ($(this).scrollTop() > offset) {
          $(".back-to-top").fadeIn(duration);
        } else {
          $(".back-to-top").fadeOut(duration);
        }
      });

      $(".back-to-top").click(function() {
        $("html, body").animate(
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
