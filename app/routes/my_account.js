import accountDetails from "./account_details";

export default accountDetails.extend({
  setupController(controller, model, transition) {
    this._super(...arguments);
    let applicationController = this.controllerFor("application");
    applicationController.set("showSidebar", true);
    applicationController.set(
      "pageTitle",
      this.get("intl").t("my_dashboard.title")
    );
  },

  resetController: function(controller, isExiting) {
    this._super.apply(this, arguments);
    if (isExiting) {
      this.controllerFor("application").set(
        "pageTitle",
        this.get("intl").t("browse.title")
      );
    }
  }
});
