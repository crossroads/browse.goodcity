import Ember from "ember";
import config from "../config/environment";

export default Ember.Controller.extend({
  isMobileApp: config.cordova.enabled,
  showCartDetailSidebar: false,
  packageCategoryReloaded: false,
  flashMessage: Ember.inject.service(),
  subscription: Ember.inject.service(),
  queryParams: ["orderCancelled"],
  triggerFlashMessage: false,
  previousRouteName: null,

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

  cancelOrderFlashMessage: Ember.observer(
    "orderCancelled",
    "triggerFlashMessage",
    function() {
      var previousRoute = this.get("previousRouteName");
      if (
        this.get("orderCancelled") &&
        (previousRoute === "order.schedule_details" ||
          previousRoute === "order.confirm")
      ) {
        this.get("flashMessage").show("order.flash_cancelled_message");
      }
    }
  ),

  parentCategories: Ember.computed(
    "model.[]",
    "packageCategoryReloaded",
    function() {
      var model = this.get("model");
      model.forEach(packageCategory => {
        packageCategory.toggleProperty("reloadPackageCategory");
      });
      return this.get("model").filterBy("parentId", null);
    }
  )
});
