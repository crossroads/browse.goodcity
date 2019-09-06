import PublicRoute from "./browse_pages";

export default PublicRoute.extend({
  model(params) {
    return this.store.peekRecord("item", params["id"]);
  },

  setupController(controller, model) {
    controller.set("model", model);
    if (model) {
      controller.set("previewUrl", model.get("previewImageUrl"));
    }
    this.controllerFor("application").set(
      "pageTitle",
      this.get("intl").t("itemdetail.view")
    );
  }
});
