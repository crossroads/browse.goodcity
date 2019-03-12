import PublicRoute from "./browse_pages";

export default PublicRoute.extend({
  model(params) {
    return this.store.peekRecord("package", params["id"]);
  },

  renderTemplate() {
    this.render("item", { controller: "package" });
  },

  setupController(controller, model) {
    this._super(...arguments);
    if (model) {
      controller.set("model", model);
      controller.set("item", model);
      controller.set("previewUrl", model.get("previewImageUrl"));
    }
    this.controllerFor("application").set(
      "pageTitle",
      this.get("i18n").t("itemdetail.view")
    );
  }
});
