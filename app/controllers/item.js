import Ember from "ember";
import config from "../config/environment";

export default Ember.Controller.extend({
  messageBox: Ember.inject.service(),
  application: Ember.inject.controller(),
  packageCategory: Ember.inject.controller(),
  queryParams: ["categoryId", "sortBy"],
  prevPath: null,
  categoryId: null,
  showPrevNextButtons: null,
  cart: Ember.inject.service(),
  sortBy: "createdAt",
  item: Ember.computed.alias("model"),
  noNextItem: Ember.computed.empty("nextItem"),
  noPreviousItem: Ember.computed.empty("previousItem"),
  hideThumbnails: Ember.computed.gt("item.sortedImages.length", 1),
  smallScreenPreviewUrl: Ember.computed.alias(
    "item.displayImage.smallScreenPreviewImageUrl"
  ),
  itemNotAvailableShown: false,
  hasCartItems: Ember.computed.alias("application.hasCartItems"),
  isMobileApp: config.cordova.enabled,

  direction: null,

  isOrderFulfilmentUser: Ember.computed(function() {
    let user = this.get("session.currentUser");
    return user.hasRole("Order fulfilment");
  }),

  presentInCart: Ember.computed("item", "cart.counter", function() {
    return this.get("cart").contains(this.get("item"));
  }),

  allPackages: Ember.computed("item.packages.@each.isAvailable", function() {
    var item = this.get("item");
    return item.get("isItem")
      ? item.get("packages").filterBy("isAvailable")
      : [item];
  }),

  categoryObj: Ember.computed("categoryId", function() {
    return this.store.peekRecord("package_category", this.get("categoryId"));
  }),

  linkDisplayName: Ember.computed("prevPath", "categoryObj", function() {
    let prevPath = this.get("prevPath");
    if (prevPath === "search_goods") {
      this.set("showPrevNextButtons", false);
      return this.get("i18n").t("search_goods.back");
    }
    this.set("showPrevNextButtons", true);
    return this.get("categoryObj.name");
  }),

  selectedSort: Ember.computed("sortBy", function() {
    return [this.get("sortBy")];
  }),

  sortedItems: Ember.computed.sort("categoryObj.items", "selectedSort"),

  nextItem: Ember.computed("model", "sortedItems.[]", function() {
    var currentItem = this.get("item");
    var items = this.get("sortedItems").toArray();
    return items[items.indexOf(currentItem) + 1];
  }),

  previousItem: Ember.computed("model", "sortedItems.[]", function() {
    var currentItem = this.get("item");
    var items = this.get("sortedItems").toArray();
    return items[items.indexOf(currentItem) - 1];
  }),

  previewUrl: Ember.computed("item.previewImageUrl", {
    get() {
      return this.get("item.previewImageUrl");
    },
    set(key, value) {
      return value;
    }
  }),

  setAndRedirectToCategory(category) {
    const parentId = category.get("parentId");
    this.transitionToRoute(
      "package_category",
      parentId ? parentId : category.id
    );
    if (parentId) {
      this.get("packageCategory").set("selectedCategoryId", category);
    }
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

    requestItem(item) {
      this.get("cart").add(item);
      Ember.run.later(
        this,
        function() {
          this.get("application").send("displayCart");
        },
        50
      );
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
