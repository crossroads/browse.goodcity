import PublicRoute from "./browse_pages";
import { inject as service } from "@ember/service";

export default PublicRoute.extend({
  messageBox: service(),
  i18n: service(),

  model(params) {
    return this.store.peekRecord("package_category", params["id"]);
  },

  afterModel(model, transition) {
    if (!model) {
      transition.abort();
      this.get("messageBox").alert(
        this.get("i18n").t("invalid_category_error"),
        () => {
          this.transitionTo("browse");
        }
      );
    }
  },

  setupController(controller, model) {
    if (model) {
      controller.set("model", model);
      controller.set("category", model);
      this.controllerFor("application").set("pageTitle", model.get("name"));
    }
    controller.set("selectedSort", ["createdAt:desc"]);
  },

  resetController(controller) {
    controller.set("selectedCategoryId", null);
  }
});
