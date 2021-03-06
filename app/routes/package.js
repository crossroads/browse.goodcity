import PublicRoute from "./browse_pages";

export default PublicRoute.extend({
  model(params) {
    return this.store.peekRecord("package", params["id"]);
  },

  renderTemplate() {
    this.render("package_set", { controller: "package" });
  },

  setupController(controller, model) {
    this._super(...arguments);
    if (model) {
      controller.set("model", model);
      controller.set("prevPath", this.router.currentPath);
      controller.set("requestedQty", 1);
      controller.set("previewUrl", model.get("previewImageUrl"));
    }
    this.controllerFor("application").set(
      "pageTitle",
      this.get("i18n").t("itemdetail.view")
    );
  }
});
