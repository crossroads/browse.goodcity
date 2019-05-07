import Ember from "ember";

export default Ember.Route.extend({
  previousRouteName: null,
  backLink: null,
  previousURL: null,

  beforeModel() {
    this.set("previousRouteName", null);
    var previousRoutes = this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();
    if (previousRoute && this.isPreviousRouteStatic(previousRoute.name)) {
      this.set("previousRouteName", "home");
    }
    this.set("previousURL", this.get("router").currentURL);
  },

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
      applicationController.set(
        "pageTitle",
        this.get("i18n").t("browse.title")
      );
      applicationController.set("hideHeaderBar", false);
    }
  },

  isPreviousRouteStatic(previousPathName) {
    return ["about", "terms", "faq", "privacy"].indexOf(previousPathName) >= 0;
  },

  actions: {
    back: function() {
      let prevPathName = this.get("previousRouteName");
      if (prevPathName) {
        this.transitionTo(prevPathName);
      } else {
        this.transitionTo(this.get("previousURL"));
      }
    }
  }
});
