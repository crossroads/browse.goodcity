import AuthorizeRoute from "./../authorize";

export default AuthorizeRoute.extend({
  model() {
    var orderId = this.paramsFor("order").order_id;
    return (
      this.store.peekRecord("order", orderId) ||
      this.store.findRecord("order", orderId)
    );
  },

  afterModel() {
    window.scrollTo(0, 0); //https://github.com/dollarshaveclub/ember-router-scroll. Read this link for nested route issue for not scrolling at top of the page
  },

  setupController() {
    this._super(...arguments);
    this.controllerFor("application").set("showSidebar", false);
  },

  deactivate() {
    this.controllerFor("application").set("showSidebar", true);
  }
});
