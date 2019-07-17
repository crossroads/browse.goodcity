import Ember from "ember";
import { containsAny } from "../utils/helpers";
import config from "../config/environment";
import AjaxPromise from "browse/utils/ajax-promise";
import cancelOrderMixin from "../mixins/cancel_order";
import _ from "lodash";
const { getOwner } = Ember;

export default Ember.Controller.extend(cancelOrderMixin, {
  isMobileApp: config.cordova.enabled,
  appVersion: config.APP.VERSION,
  subscription: Ember.inject.service(),
  screenresize: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  orderService: Ember.inject.service(),
  cart: Ember.inject.service(),
  i18n: Ember.inject.service(),
  showSidebar: true,
  isWideScreen: Ember.computed.alias("screenresize.isWideScreen"),
  isHomePage: Ember.computed("currentPath", function() {
    return this.get("currentPath") === "home";
  }),

  app_id: config.APP.ANDROID_APP_ID,
  ios_app_id: config.APP.APPLE_APP_ID,
  appTitle: config.APP.TITLE,
  bannerImage: config.APP.BANNER_IMAGE,
  bannerReopenDays: config.BANNER_REOPEN_DAYS,

  initializer: Ember.on("init", function() {
    this.get("subscription").wire();
    this.loadingCounter = 0;
  }),

  isAndroidBrowser: Ember.computed("isMobileApp", function() {
    return /Android/i.test(navigator.userAgent) && !this.get("isMobileApp");
  }),

  showSearchIcon: Ember.computed("currentPath", function() {
    return ["browse", "package_category"].indexOf(this.get("currentPath")) >= 0;
  }),

  displayCart: false,
  showCartDetailSidebar: false,
  cartscroll: Ember.inject.service(),

  hasCartItems: Ember.computed.alias("cart.isNotEmpty"),
  cartLength: Ember.computed.alias("cart.groupedPackages.length"),

  isUserLoggedIn: Ember.computed("session.authToken", function() {
    return !!this.get("session.authToken");
  }),

  showOffCanvas: Ember.computed("showSidebar", "currentPath", function() {
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

  addMoveLeft: Ember.computed(
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
    moveSidebarUp() {
      $(".left-off-canvas-menu").removeClass("move-bottom");
    },

    logMeOut() {
      this.get("subscription").unwire();
      this.session.clear(); // this should be first since it updates isLoggedIn status
      this.unloadModels();
      this.transitionToRoute("browse");
    },

    displayCart() {
      this.set("showCartDetailSidebar", true);
      this.toggleProperty("displayCart");
      Ember.run.later(
        this,
        function() {
          this.get("cartscroll").resize();
        },
        0
      );
    },

    checkout() {
      const accountComplete = this.get("session").accountDetailsComplete();
      if (!accountComplete && this.get("hasCartItems")) {
        this.set("showCartDetailSidebar", false);
        this.transitionToRoute("account_details", {
          queryParams: {
            onlineOrder: true,
            bookAppointment: false
          }
        });
      } else {
        this.submitCart();
      }
    },

    showItemDetails(record) {
      let isItem = record.get("isItem");
      let categoryId = record.get("allPackageCategories.firstObject.id");
      let sortBy = "createdAt:desc";

      const route = isItem ? "item" : "package";
      const routeId = record.get("id");
      this.transitionToRoute(route, routeId, {
        queryParams: {
          categoryId: categoryId,
          sortBy: sortBy
        }
      });
      this.set("displayCart", false);
      this.set("showCartDetailSidebar", false);
    },

    openCart() {
      this.transitionToRoute("cart");
    }
  }
});
