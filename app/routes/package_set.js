import PublicRoute from "./browse_pages";

export default PublicRoute.extend({
  model(params) {
    return this.store.peekRecord("package_set", params["id"]);
  },

  setupController(controller, model) {
    controller.set("model", model);
    if (model) {
      controller.set("previewUrl", model.get("previewImageUrl"));
    }
    this.controllerFor("application").set(
      "pageTitle",
      this.get("i18n").t("itemdetail.view")
    );
  }
});
