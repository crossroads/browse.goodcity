import { computed, observer } from "@ember/object";
import { alias, empty, gt, sort } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import Controller, { inject as controller } from "@ember/controller";
import config from "../config/environment";
import _ from "lodash";

export default Controller.extend({
  messageBox: service(),
  application: controller(),
  packageCategory: controller(),
  requestedQty: 1,
  queryParams: ["categoryId", "sortBy"],
  prevPath: null,
  packageUnavailableInSet: false,
  categoryId: null,
  cart: service(),
  sortBy: "createdAt",
  noNextItem: empty("nextItem"),
  noPreviousItem: empty("previousItem"),
  hideThumbnails: gt("item.sortedImages.length", 1),
  smallScreenPreviewUrl: alias("item.displayImage.smallScreenPreviewImageUrl"),
  itemNotAvailableShown: false,
  hasCartItems: alias("application.hasCartItems"),
  isMobileApp: config.cordova.enabled,

  direction: null,

  isOrderFulfilmentUser: computed(function() {
    let user = this.get("session.currentUser");
    return user.hasRole("Order fulfilment");
  }),

  presentInCart: computed("model", "cart.counter", function() {
    return this.get("cart").contains(this.get("model"));
  }),

  allPackages: computed(
    "model",
    "model.isSet",
    "model.packagesAndSets.@each.isAvailable",
    function() {
      var record = this.get("model");
      if (!record) {
        this.send("noItemsPresent");
        this.set("packageUnavailableInSet", true);
        return [];
      }
      return record.get("isSet") ? record.get("packages") : [record];
    }
  ),
  packageUnavailableInSet: computed(
    "allPackages.@each.availableQuantity",
    function() {
      let quantity = this.get("allPackages").any(
        pkg => pkg.get("availableQuantity") == 0
      );
      return quantity ? true : false;
    }
  ),

  notAvailableInStock: observer(
    "allPackages.@each.availableQuantity",
    function() {
      let quantity = this.get("allPackages").any(
        pkg => pkg.get("availableQuantity") == 0
      );
      if (quantity) {
        this.set("packageUnavailableInSet", true);
      } else {
        this.set("packageUnavailableInSet", false);
      }
    }
  ),

  categoryObj: computed("categoryId", function() {
    if (this.get("categoryId")) {
      return this.store.peekRecord("package_category", this.get("categoryId"));
    }
  }),

  linkDisplayName: computed("prevPath", "categoryObj", function() {
    let prevPath = this.get("prevPath");
    if (prevPath === "search_goods") {
      return this.get("i18n").t("search_goods.back");
    }
    return this.get("categoryObj.name");
  }),

  showPrevNextButtons: computed("prevPath", function() {
    return this.get("prevPath") !== "search_goods";
  }),

  selectedSort: computed("sortBy", function() {
    return [this.get("sortBy")];
  }),

  sortedItems: sort("categoryObj.packagesAndSets", "selectedSort"),

  nextItem: computed("model", "sortedItems.[]", function() {
    var currentItem = this.get("model");
    var items = this.get("sortedItems").toArray();
    return items[items.indexOf(currentItem) + 1];
  }),

  previousItem: computed("model", "sortedItems.[]", function() {
    var currentItem = this.get("model");
    var items = this.get("sortedItems").toArray();
    return items[items.indexOf(currentItem) - 1];
  }),

  previewUrl: computed("item.previewImageUrl", {
    get() {
      return this.get("item.previewImageUrl");
    },
    set(key, value) {
      return value;
    }
  }),

  setAndRedirectToCategory(category) {
    if (category) {
      const parentId = category.get("parentId");
      if (parentId) {
        this.get("packageCategory").set("selectedCategoryId", category);
      }
      this.transitionToRoute("package_category", parentId || category.id);
    } else {
      this.transitionToRoute("browse");
    }
  },

  actions: {
    setRequestedQty(value) {
      this.set("requestedQty", value);
    },

    showPreview(image) {
      this.set("previewUrl", image.get("previewImageUrl"));
    },
    noItemsPresent: function() {
      let i18n = this.get("i18n");
      this.get("messageBox").custom(
        i18n.t("browse.item_unavailable"),
        i18n.t("okay"),
        () => {
          this.transitionToRoute("browse");
        }
      );
    },
    goToStockItem(inventoryNumber) {
      let finalUrl;

      if (this.get("isMobileApp") && cordova.platformId === "android") {
        // jshint ignore:line
        finalUrl =
          "android-app://hk.goodcity.stockstaging/https/" +
          config.APP.STOCK_ANDROID_APP_HOST_URL +
          "/items/" +
          inventoryNumber;
        window.open(finalUrl, "_system");
      } else {
        finalUrl = config.APP.STOCK_APP_HOST_URL + "/items/" + inventoryNumber;
        window.open(finalUrl, "_blank");
      }
    },

    setDirectionAndRender(direction) {
      this.set("direction", direction);
      var targetItem =
        direction === "moveRight"
          ? this.get("previousItem")
          : this.get("nextItem");

      if (targetItem) {
        if (targetItem.get("isItem")) {
          this.transitionToRoute("item", targetItem, {
            queryParams: {
              sortBy: this.get("sortBy"),
              categoryId: this.get("categoryId")
            }
          });
        } else {
          this.transitionToRoute("package", targetItem, {
            queryParams: {
              sortBy: this.get("sortBy"),
              categoryId: this.get("categoryId")
            }
          });
        }
      }
    },

    setChildCategory(category) {
      this.setAndRedirectToCategory(category);
    },

    back() {
      let prevPath = this.get("prevPath");
      if (prevPath === "search_goods") {
        return this.transitionToRoute("search_goods");
      }
      this.setAndRedirectToCategory(this.get("categoryObj"));
    }
  }
});
