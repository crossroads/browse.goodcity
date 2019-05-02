import Ember from "ember";

export default Ember.Route.extend({
  setupController(controller, model, transition) {
    this._super(...arguments);
    let applicationController = this.controllerFor("application");
    applicationController.set("showSidebar", true);
    applicationController.set(
      "pageTitle",
      this.get("i18n").t(`${transition.targetName}.title`)
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
