import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  setupController() {
    this.controllerFor("application").set("showSidebar", false);
  },

  resetController: function(isExiting) {
    this._super.apply(this, arguments);
    if (isExiting) {
      this.controllerFor("application").set("showSidebar", true);
    }
  }
});
