import { later } from "@ember/runloop";
import { computed } from "@ember/object";
import { alias, empty, gt, sort } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import Controller, { inject as controller } from "@ember/controller";
import config from "../config/environment";
import _ from "lodash";

export default Controller.extend({
  messageBox: service(),
  application: controller(),
  packageCategory: controller(),
  queryParams: ["categoryId", "sortBy"],
  prevPath: null,
  categoryId: null,
  cart: service(),
  sortBy: "createdAt",
  item: alias("model"),
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

  presentInCart: computed("item", "cart.counter", function() {
    return this.get("cart").contains(this.get("item"));
  }),

  allPackages: computed("item.packages.@each.isAvailable", function() {
    var item = this.get("item");
    return item.get("isItem")
      ? item.get("packages").filterBy("isAvailable")
      : [item];
  }),

  notAvailableInStock: computed("allPackages.@each.onHandQuantity", function() {
    let quantities = this.get("allPackages").map(pkg =>
      pkg.get("onHandQuantity")
    );
    return _.sum(quantities) === 0;
  }),

  categoryObj: computed("categoryId", function() {
    return this.store.peekRecord("package_category", this.get("categoryId"));
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

  sortedItems: sort("categoryObj.items", "selectedSort"),

  nextItem: computed("model", "sortedItems.[]", function() {
    var currentItem = this.get("item");
    var items = this.get("sortedItems").toArray();
    return items[items.indexOf(currentItem) + 1];
  }),

  previousItem: computed("model", "sortedItems.[]", function() {
    var currentItem = this.get("item");
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
    const parentId = category.get("parentId");
    if (parentId) {
      this.get("packageCategory").set("selectedCategoryId", category);
    }
    this.transitionToRoute(
      "package_category",
      parentId ? parentId : category.id
    );
  },

  actions: {
    showPreview(image) {
      this.set("previewUrl", image.get("previewImageUrl"));
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
