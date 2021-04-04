import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  setupController(controller, model, transition) {
    this._super(...arguments);
    let applicationController = this.controllerFor("application");
    applicationController.set("hideHeaderBar", false);
    applicationController.set("pageTitle", "Notification");
    controller.on();
  },

  resetController: function(controller, isExiting) {
    this._super.apply(this, arguments);
    if (isExiting) {
      let applicationController = this.controllerFor("application");
      applicationController.set("hideHeaderBar", true);
      // applicationController.set(
      //   "pageTitle",
      //   this.get("i18n").t("browse.title")
      // );
      controller.set("notifications", []);
    }

    controller.off();
  }
  // deactivate(){
  //   this.controllerFor('application').set('showSidebar', true);
  // }
});
