import Ember from "ember";
import config from "../config/environment";
import _ from "lodash";

const { getOwner } = Ember;

export default Ember.Route.extend({
  logger: Ember.inject.service(),
  preloadService: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  previousRoute: null,
  isErrPopUpAlreadyShown: false,

  unlessIncludesCurrentPath() {
    var currentPath = window.location.href;
    return !(
      currentPath.indexOf("login") >= 0 ||
      currentPath.indexOf("authenticate") >= 0 ||
      currentPath.indexOf("category") >= 0 ||
      currentPath.indexOf("package") >= 0 ||
      currentPath.indexOf("item") >= 0 ||
      currentPath.indexOf("browse") >= 0 ||
      window.location.pathname === "/"
    );
  },

  init() {
    var _this = this;
    var storageHandler = function(object) {
      var currentPath = window.location.href;
      var authToken = window.localStorage.getItem("authToken");
      if (!authToken && object.unlessIncludesCurrentPath()) {
        object.session.clear();
        object.store.unloadAll();
        object.transitionTo("/login");
      } else if (
        authToken &&
        (currentPath.indexOf("login") >= 0 ||
          currentPath.indexOf("authenticate") >= 0)
      ) {
        object.transitionTo("/");
      }
    };
    window.addEventListener(
      "storage",
      function() {
        storageHandler(_this);
      },
      false
    );
  },

  beforeModel(transition) {
    try {
      localStorage.test = "isSafariPrivateBrowser";
    } catch (e) {
      this.get("messageBox").alert(this.get("i18n").t("QuotaExceededError"));
    }

    let language = this.get("session.language") || config.i18n.defaultLocale;
    if (transition.queryParams.ln) {
      language = transition.queryParams.ln === "zh-tw" ? "zh-tw" : "en";
    }
    this.set("session.language", language);
    this.set("i18n.locale", language);
    this.set("previousRoute", transition);
    Ember.onerror = window.onerror = error => {
      if (error.errors && error.errors[0] && error.errors[0].status === "401") {
        transition.abort();
      }
      this.handleError(error);
    };
    return this.get("preloadService").preloadData();
  },

  renderTemplate() {
    this.render();
    this.render("sidebar", {
      into: "application",
      outlet: "sidebar"
    });
  },

  redirectToLogin() {
    if (this.session.get("isLoggedIn")) {
      this.session.clear();
      this.store.unloadAll();
      var loginController = this.controllerFor("login");
      loginController.set("attemptedTransition", this.get("previousRoute"));
      this.transitionTo("login");
    }
  },

  getErrorMessage(reason) {
    const error =
      _.get(reason, "responseJSON.errors[0]") ||
      _.get(reason, "responseJSON.error") ||
      _.get(reason, "errors[0]") ||
      _.get(reason, "error");

    if (error && _.isString(error)) {
      return error;
    }
    return this.get("i18n").t("unexpected_error");
  },

  showSomethingWentWrong(reason) {
    this.get("logger").error(reason);
    if (!this.get("isErrPopUpAlreadyShown")) {
      this.set("isErrPopUpAlreadyShown", true);
      this.get("messageBox").alert(this.getErrorMessage(reason), () => {
        this.set("isErrPopUpAlreadyShown", false);
      });
    }
  },

  offlineError(reason) {
    this.get("messageBox").alert(this.get("i18n").t("offline_error"));
    if (!reason.isAdapterError) {
      this.get("logger").error(reason);
    }
  },

  quotaExceededError(reason) {
    this.get("logger").error(reason);
    this.get("messageBox").alert(this.get("i18n").t("QuotaExceededError"));
  },

  handleError: function(reason) {
    try {
      var status;
      // let hasPopup = Ember.$('.reveal-modal:visible').length > 0;
      try {
        status = parseInt(reason.errors[0].status, 10);
      } catch (err) {
        status = reason.status;
      }

      if (!window.navigator.onLine) {
        this.offlineError(reason);
      } else if (reason.name === "QuotaExceededError") {
        this.quotaExceededError(reason);
      } else if (reason.name === "NotFoundError" && reason.code === 8) {
        return false;
      } else if (status === 401) {
        this.redirectToLogin();
      } else {
        this.showSomethingWentWrong(reason);
      }
    } catch (err) {
      console.log(err);
    }
  },

  actions: {
    loading() {
      if (this.loadingView) {
        this.loadingView.destroy();
        this.loadingView = null;
      }
      if (!this.loadingView) {
        this.loadingView = Ember.getOwner(this)
          .lookup("component:loading")
          .append();
      }
      this.router.one("didTransition", this.loadingView, "destroy");
    },

    error(reason) {
      try {
        this.handleError(reason);
      } catch (err) {
        console.log(err);
      }
    }
  },

  setupController(controller, model) {
    controller.set("model", model);
    controller.set("pageTitle", this.get("i18n").t("browse.title"));
  }
});
