import PublicRoute from "./browse_pages";

export default PublicRoute.extend({
  model() {
    return this.store.peekAll("package_category");
  },

  setupController(controller, model) {
    controller.set("model", model);
    controller.toggleProperty("triggerFlashMessage");
    this.controllerFor("application").set(
      "pageTitle",
      this.get("i18n").t("browse.browse_title")
    );
    controller.on();
  },

  resetController(controller) {
    controller.off();
  }
});
