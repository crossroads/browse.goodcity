import PublicRoute from "./browse_pages";

export default PublicRoute.extend({
  setupController(controller, model, transition) {
    this._super(...arguments);
    let applicationController = this.controllerFor("application");
    applicationController.set("hideHeaderBar", true);
  },

  resetController: function(controller, isExiting) {
    this._super.apply(this, arguments);
    if (isExiting) {
      let applicationController = this.controllerFor("application");
      applicationController.set("hideHeaderBar", false);
    }
  }
});
