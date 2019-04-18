import PublicRoute from "./browse_pages";

export default PublicRoute.extend({
  setupController(controller, model) {
    this._super(...arguments);
    let applicationController = this.controllerFor("application");
    controller.set("cartLength", applicationController.get("cartLength"));
    applicationController.set("isHomePage", true);
  },

  resetController: function(controller, isExiting) {
    this._super.apply(this, arguments);
    if (isExiting) {
      this.controllerFor("application").set("isHomePage", false);
    }
  }
});
