import detail from "./detail";

export default detail.extend({
  afterModel() {
    window.scrollTo(0, 0); //https://github.com/dollarshaveclub/ember-router-scroll. Read this link for nested route issue for not scrolling at top of the page
  },

  setupController(controller, model) {
    this._super(controller, model);
  }
});
