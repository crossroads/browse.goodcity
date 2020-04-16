import { observer, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import Controller, { inject as controller } from "@ember/controller";
import config from "../config/environment";

export default Controller.extend({
  isMobileApp: config.cordova.enabled,
  packageCategory: controller(),
  showCartDetailSidebar: false,
  packageCategoryReloaded: false,
  flashMessage: service(),
  subscription: service(),
  queryParams: ["orderCancelled"],
  triggerFlashMessage: false,

  orderCancelled: false,

  on() {
    this.get("subscription").on("change:package", this, this.onPackageChange);
  },

  off() {
    this.get("subscription").off("change:package", this, this.onPackageChange);
  },

  onPackageChange() {
    this.toggleProperty("packageCategoryReloaded");
  },

  cancelOrderFlashMessage: observer(
    "orderCancelled",
    "triggerFlashMessage",
    function() {
      if (this.get("orderCancelled")) {
        this.get("flashMessage").show("order.flash_cancelled_message");
      }
    }
  ),

  parentCategories: computed("model.[]", "packageCategoryReloaded", function() {
    var model = this.get("model");
    model.forEach(packageCategory => {
      packageCategory.toggleProperty("reloadPackageCategory");
    });
    return this.get("model").filterBy("parentId", null);
  }),
  actions: {
    setChildCategory(childCategory) {
      let parentId = childCategory.get("parentId");
      this.transitionToRoute("package_category", parentId);
      this.get("packageCategory").set("selectedCategoryId", childCategory);
    }
  }
});
