import accountDetails from "./account_details";

export default accountDetails.extend({
  setupController(controller, model, transition) {
    this._super(...arguments);
    let applicationController = this.controllerFor("application");
    applicationController.set("showSidebar", true);
    let pageTitle =
      transition.targetName === "terms"
        ? this.get("i18n").t("terms.title")
        : this.get("i18n").t("pics.title");
    applicationController.set("pageTitle", pageTitle);
  },

  resetController: function(controller, isExiting) {
    this._super.apply(this, arguments);
    if (isExiting) {
      this.controllerFor("application").set(
        "pageTitle",
        this.get("i18n").t("browse.title")
      );
    }
  }
});
