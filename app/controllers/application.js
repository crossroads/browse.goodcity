import { later } from "@ember/runloop";
import { on } from "@ember/object/evented";
import EmberObject from "@ember/object";
import { computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import Controller from "@ember/controller";
import { getOwner } from "@ember/application";
import { containsAny } from "../utils/helpers";
import config from "../config/environment";
import AjaxPromise from "browse/utils/ajax-promise";
import cancelOrderMixin from "../mixins/cancel_order";
import _ from "lodash";

export default Controller.extend(cancelOrderMixin, {
  isMobileApp: config.cordova.enabled,
  appVersion: config.APP.VERSION,
  subscription: service(),
  screenresize: service(),
  messageBox: service(),
  orderService: service(),
  cart: service(),
  i18n: service(),
  showSidebar: true,
  isWideScreen: alias("screenresize.isWideScreen"),
  isHomePage: computed("currentPath", function() {
    return this.get("currentPath") === "home";
  }),
  updatedValue: EmberObject.create({}),
  app_id: config.APP.ANDROID_APP_ID,
  ios_app_id: config.APP.APPLE_APP_ID,
  appTitle: config.APP.TITLE,
  bannerImage: config.APP.BANNER_IMAGE,
  bannerReopenDays: config.BANNER_REOPEN_DAYS,

  initializer: on("init", function() {
    this.get("subscription").wire();
    this.loadingCounter = 0;
  }),

  isAndroidBrowser: computed("isMobileApp", function() {
    return /Android/i.test(navigator.userAgent) && !this.get("isMobileApp");
  }),

  showSearchIcon: computed("currentPath", function() {
    return ["browse", "package_category"].indexOf(this.get("currentPath")) >= 0;
  }),

  showCartDetailSidebar: false,
  cartscroll: service(),

  hasCartItems: alias("cart.isNotEmpty"),

  cartLength: alias("cart.groupedPackages.length"),

  isUserLoggedIn: computed("session.authToken", function() {
    return !!this.get("session.authToken");
  }),

  showOffCanvas: computed("showSidebar", "currentPath", function() {
    let url = window.location.href;
    return !containsAny(url, [
      "request_purpose",
      "search_organisation",
      "account_details",
      "schedule_details",
      "goods_details",
      "client_information",
      "search_code",
      "confirm_booking",
      "booking_success"
    ]);
  }),

  addMoveLeft: computed(
    "isHomePage",
    "hasCartItems",
    "showOffCanvas",
    "isMobileApp",
    function() {
      return (
        this.get("showOffCanvas") &&
        !this.get("isMobileApp") &&
        this.get("hasCartItems") &&
        !this.get("isHomePage")
      );
    }
  ),

  startLoading() {
    this.loadingCounter++;
    this.updateLoadingSpinner();
  },

  stopLoading() {
    if (this.loadingCounter === 0) {
      return;
    }
    this.loadingCounter--;
    this.updateLoadingSpinner();
  },

  updateLoadingSpinner() {
    if (this.loadingCounter === 0 && this.loadingView) {
      this.loadingView.destroy();
      this.loadingView = null;
    } else if (this.loadingCounter && !this.loadingView) {
      this.loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
    }
  },

  unloadModels() {
    var UNLOAD_MODELS = [
      "order",
      "orders_package",
      "user",
      "user_role",
      "organisation",
      "organisations_user",
      "role"
    ];
    UNLOAD_MODELS.forEach(model => this.store.unloadAll(model));
  },

  updateRequestedQuantityValue(record) {
    Object.keys(record).map(pkgId => {
      return this.get("cart").updateRequestedQuantity(pkgId, record[pkgId]);
    });
  },
  submitCart() {
    this.set("showCartDetailSidebar", false);
    if (!this.get("cart.canCheckout")) {
      return this.get("messageBox").alert(
        this.get("i18n").t("items_not_available"),
        _.noop
      );
    }
    this.transitionToRoute("submitted_order_selection");
  },

  actions: {
    setUpdatedValue(value, id) {
      this.get("updatedValue").set(id, value);
    },

    moveSidebarUp() {
      $(".left-off-canvas-menu").removeClass("move-bottom");
    },

    logMeOut() {
      this.get("subscription").unwire();
      this.session.clear(); // this should be first since it updates isLoggedIn status
      this.unloadModels();
      this.transitionToRoute("browse");
    },

    hideCart() {
      this.set("showCartDetailSidebar", false);
      this.transitionToRoute("browse");
    },

    displayCart() {
      this.set("showCartDetailSidebar", true);
      later(
        this,
        function() {
          this.get("cartscroll").resize();
        },
        0
      );
    },

    async checkout() {
      if (this.get("cart.isEmpty")) {
        return;
      }
      await this.updateRequestedQuantityValue(this.get("updatedValue"));

      const accountComplete = this.get("session").accountDetailsComplete();
      const loggedIn = this.get("session.isLoggedIn");

      if (loggedIn && !accountComplete && this.get("cart.hasValidItems")) {
        this.set("showCartDetailSidebar", false);
        return this.transitionToRoute("account_details", {
          queryParams: {
            onlineOrder: true,
            bookAppointment: false
          }
        });
      }

      this.submitCart();
    },

    showItemDetails(record) {
      this.get("cart").navigateToItemDetails(record);
      this.set("showCartDetailSidebar", false);
    },

    openCart() {
      this.transitionToRoute("cart");
    }
  }
});
