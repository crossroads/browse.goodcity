import Ember from "ember";

export default Ember.Component.extend({
  tagName: "li",
  scrollDuration: 500,
  actions: {
    goToLink: function() {
      console.log(this);
      $("html, body").animate(
        {
          scrollTop: $(this.id).offset().top
        },
        this.get("scrollDuration")
      );
    }
  }
});
