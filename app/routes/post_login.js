import Ember from "ember";
import preloadDataMixin from "../mixins/preload_data";
import AjaxPromise from "browse/utils/ajax-promise";

export default Ember.Route.extend(preloadDataMixin, {
  cart: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  session: Ember.inject.service(),
  isBookAppointment: false,

  beforeModel(params) {
    this.set("isBookAppointment", params.queryParams.bookAppointment);
  },

  model() {
    return this.preloadData();
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
    if (this.isDetailsComplete()) {
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
  },

  isDetailsComplete() {
    const user = this.get("session.currentUser");
    if (!user) {
      return false;
    }

    const organisationsUser = user.get("organisationsUsers.firstObject");
    const organisation =
      organisationsUser && organisationsUser.get("organisation");
    const userInfoComplete =
      user.get("isInfoComplete") && user.hasRole("Charity");
    const organisationUserComplete =
      organisationsUser && organisationsUser.get("isInfoComplete");

    return userInfoComplete && organisation && organisationUserComplete;
  }
});
