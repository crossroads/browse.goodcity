import Route from "@ember/routing/route";

export default Route.extend({
  backLink: null,

  setupController(controller, model, transition) {
    this._super(...arguments);
    let applicationController = this.controllerFor("application");
    applicationController.set("hideHeaderBar", true);
    applicationController.set(
      "pageTitle",
      this.get("i18n").t(`${transition.targetName}.title`)
    );
  },

  resetController: function(controller, isExiting) {
    this._super.apply(this, arguments);
    if (isExiting) {
      let applicationController = this.controllerFor("application");
      applicationController.set("hideHeaderBar", false);
      applicationController.set(
        "pageTitle",
        this.get("i18n").t("browse.title")
      );
    }
  }
});
