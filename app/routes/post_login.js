import Ember from "ember";
import AjaxPromise from "browse/utils/ajax-promise";

export default Ember.Route.extend({
  cart: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  session: Ember.inject.service(),
  preloadService: Ember.inject.service(),
  session: Ember.inject.service(),
  isBookAppointment: false,

  beforeModel(params) {
    this.set("isBookAppointment", params.queryParams.bookAppointment);
  },

  model() {
    return this.get("preloadService").preloadData();
  },

  loadIfAbsent(modelName, id) {
    let cachedRecord = this.store.peekRecord(modelName, id);
    if (cachedRecord) {
      return Ember.RSVP.resolve(cachedRecord);
    }
    return this.store.findRecord(modelName, id);
  },

  afterModel() {
    this.redirectToTransitionOrDetails();
    localStorage.removeItem("loginParam");
    localStorage.removeItem("loginParamEmail");
  },

  redirectToTransitionOrDetails() {
    if (this.get("session").accountDetailsComplete()) {
      var attemptedTransition = this.controllerFor("login").get(
        "attemptedTransition"
      );
      var isBookAppointment = this.get("isBookAppointment");
      if (attemptedTransition) {
        attemptedTransition.retry();
        this.controllerFor("login").set("attemptedTransition", null);
      } else if (isBookAppointment === "true") {
        this.transitionTo("request_purpose");
      } else {
        this.transitionTo("browse");
      }
    } else {
      this.transitionTo("account_details");
    }
  }
});
