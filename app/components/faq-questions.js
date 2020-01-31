import Component from "@ember/component";

export default Component.extend({
  tagName: "li",
  scrollDuration: 500,
  actions: {
    goToLink: function() {
      $("html, body").animate(
        {
          scrollTop: $(this.id).offset().top
        },
        this.get("scrollDuration")
      );
    }
  }
});
