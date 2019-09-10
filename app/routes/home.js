import PublicRoute from "./browse_pages";

export default PublicRoute.extend({
  setupController(controller, model) {
    this._super(...arguments);
    let applicationController = this.controllerFor("application");
    controller.set("cartLength", applicationController.get("cartLength"));
    controller.set("hasCartItems", applicationController.get("hasCartItems"));
    applicationController.set("pageTitle", this.get("intl").t("browse.title"));
    applicationController.set("showSidebar", true);
    applicationController.set("hideHeaderBar", false);
  },

  resetController: function(controller, isExiting) {
    this._super.apply(this, arguments);
  }
});
