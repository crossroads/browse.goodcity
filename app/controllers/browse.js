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
  settings: service(),
  queryParams: ["orderCancelled"],
  triggerFlashMessage: false,
  origin_url: config.APP.ORIGIN,

  orderCancelled: false,

  freeDeliveryEnabled: computed(function() {
    return this.get("settings").readBoolean("browse.free_delivery_enabled");
  }),

  freeDeliveryPackageId: computed(function() {
    return this.get("settings").readString("browse.free_delivery_package_id");
  }),

  freeDeliveryQuantityAvailable: computed(function() {
    const packageId = this.get("freeDeliveryPackageId");
    const pkg = this.store.peekRecord("package", packageId);
    return pkg && pkg.get("availableQuantity") > 0;
  }),

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
    return this.get("model")
      .filterBy("parentId", null)
      .filterBy("visibleInBrowse", true);
  }),
  actions: {
    setChildCategory(childCategory) {
      let parentId = childCategory.get("parentId");
      this.transitionToRoute("package_category", parentId);
      this.get("packageCategory").set("selectedCategoryId", childCategory);
    }
  }
});
