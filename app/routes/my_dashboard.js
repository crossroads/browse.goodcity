import accountDetails from "./account_details";

export default accountDetails.extend({
  setupController(controller, model, transition) {
    this._super(...arguments);
    this.controllerFor("application").set("showSidebar", true);
    this.controllerFor("application").set(
      "pageTitle",
      this.get("i18n").t("my_dashboard.title")
    );
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