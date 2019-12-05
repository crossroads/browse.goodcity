import Ember from "ember";

export default Ember.Route.extend({
  backLink: null,
  scrollDuration: 500,

  beforeModel() {
    var previousRoutes = this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();
    if (previousRoute && this.isPreviousRouteStatic(previousRoute.name)) {
      this.set("backLink", "home");
    } else {
      this.set("backLink", this.get("router").currentURL);
    }
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
      this.set("backLink", null);
      let applicationController = this.controllerFor("application");
      applicationController.set("hideHeaderBar", false);
      applicationController.set(
        "pageTitle",
        this.get("i18n").t("browse.title")
      );
    }
  },

  isPreviousRouteStatic(previousPathName) {
    return ["about", "terms", "faq", "privacy"].indexOf(previousPathName) >= 0;
  },

  actions: {
    back: function() {
      let backLink = this.get("backLink");
      if (backLink) {
        this.transitionTo(backLink);
      } else {
        window.history.back(); // equivalent to window.history.go(-1)
      }
    }
  }
});
