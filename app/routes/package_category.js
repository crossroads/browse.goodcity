import PublicRoute from "./browse_pages";

export default PublicRoute.extend({
  model(params) {
    return this.store.peekRecord("package_category", params["id"]);
  },

  setupController(controller, model) {
    if (model) {
      controller.set("model", model);
      controller.set("category", model);
      this.controllerFor("application").set("pageTitle", model.get("name"));
    }
    controller.set("selectedCategoryId", null);
    controller.set("selectedSort", ["createdAt:desc"]);
  }
});
