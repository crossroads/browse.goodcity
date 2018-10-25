import Ember from 'ember';
import config from '../config/environment';
import preloadDataMixin from '../mixins/preload_data';

const { getOwner } = Ember;

export default Ember.Route.extend(preloadDataMixin, {

  logger: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),
  previousRoute: null,
  isErrPopUpAlreadyShown: false,
  isMustLoginAlreadyShown: false,

  unlessIncludesCurrentPath() {
    var currentPath = window.location.href;
    return !(currentPath.indexOf("login") >= 0 || currentPath.indexOf("authenticate") >= 0 || currentPath.indexOf("category") >= 0 || currentPath.indexOf("package") >= 0 || currentPath.indexOf("item") >= 0 || currentPath.indexOf("browse") >= 0 || window.location.pathname === "/");
  },

  init() {
    var _this = this;
    var storageHandler = function (object) {
      var currentPath = window.location.href;
      var authToken = window.localStorage.getItem('authToken');
      if(!authToken && !object.get('isMustLoginAlreadyShown') && object.unlessIncludesCurrentPath()) {
        object.set('isMustLoginAlreadyShown', true);
        object.get('messageBox').alert(object.get("i18n").t('must_login'), () => {
          object.session.clear();
          object.store.unloadAll();
          object.transitionTo("/login");
        });
      } else if(authToken && (currentPath.indexOf("login") >= 0 || currentPath.indexOf("authenticate") >= 0)) {
        object.transitionTo("/");
      }
    };
    window.addEventListener("storage", function() {
      storageHandler(_this);
    }, false);
  },

  beforeModel(transition) {
    try {
      localStorage.test = "isSafariPrivateBrowser";
    } catch (e) {
      this.get("messageBox").alert(this.get("i18n").t("QuotaExceededError"));
    }
    localStorage.removeItem('test');

    let language = this.get('session.language') || config.i18n.defaultLocale;
    if (transition.queryParams.ln) {
      language = transition.queryParams.ln === "zh-tw" ? "zh-tw" : "en";
    }
    this.set('session.language', language);
    this.set("i18n.locale", language);
    this.set('previousRoute',transition);
    Ember.onerror = window.onerror = error => {
      if(error.errors && error.errors[0] && error.errors[0].status === "401") {
        transition.abort();
      }
      this.handleError(error);
    };
    return this.preloadData();
  },

  renderTemplate() {
    this.render();
    this.render('sidebar', {
      into: 'application',
      outlet: 'sidebar'
    });
  },

  showLoginError() {
    if (this.session.get('isLoggedIn')) {
      this.session.clear();
      this.store.unloadAll();
      var loginController = this.controllerFor('login');
      loginController.set('attemptedTransition', this.get('previousRoute'));
      this.get('messageBox').alert(this.get("i18n").t('must_login'), () =>
        this.transitionTo('login')
      );
    }
  },

  showSomethingWentWrong(reason) {
    this.get("logger").error(reason);
    if(!this.get('isErrPopUpAlreadyShown')) {
      this.set('isErrPopUpAlreadyShown', true);
      this.get("messageBox").alert(this.get("i18n").t("unexpected_error"), () => {
        this.set('isErrPopUpAlreadyShown', false);
      });
    }
  },

  offlineError(reason){
    this.get("messageBox").alert(this.get("i18n").t("offline_error"));
    if(!reason.isAdapterError){
      this.get("logger").error(reason);
    }
  },

  quotaExceededError(reason){
    this.get("logger").error(reason);
    this.get("messageBox").alert(this.get("i18n").t("QuotaExceededError"));
  },

  handleError: function(reason) {
    try
    {
      var status;
      // let hasPopup = Ember.$('.reveal-modal:visible').length > 0;
      try { status = parseInt(reason.errors[0].status, 10); }
      catch (err) { status = reason.status; }

      if(!window.navigator.onLine){
        this.offlineError(reason);
      } else if(reason.name === "QuotaExceededError") {
        this.quotaExceededError(reason);
      } else if (reason.name === "NotFoundError" && reason.code === 8) {
        return false;
      } else if (status === 401) {
        this.showLoginError();
      } else {
        this.showSomethingWentWrong(reason);
      }
    } catch (err) { console.log(err); }
  },

  actions: {
    loading() {
      Ember.$(".loading-indicator").remove();
      var component = getOwner(this).lookup('component:loading').append();
      this.router.one('didTransition', component, 'destroy');
    },

    error(reason) {
      try {
        this.handleError(reason);
      } catch (err) { console.log(err); }
    }
  },

  setupController(controller, model) {
    controller.set('model', model);
    controller.set("pageTitle", this.get('i18n').t("browse.title"));
  }
});
