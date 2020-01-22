import { resolve } from "rsvp";
import { inject as service } from "@ember/service";
import Route from "@ember/routing/route";
import AjaxPromise from "browse/utils/ajax-promise";

export default Route.extend({
  cart: service(),
  messageBox: service(),
  session: service(),
  preloadService: service(),
  session: service(),
  browserDetect: service(),
  isBookAppointment: false,

  beforeModel(params) {
    this.set("isBookAppointment", params.queryParams.bookAppointment);
  },

  loadIfAbsent(modelName, id) {
    let cachedRecord = this.store.peekRecord(modelName, id);
    if (cachedRecord) {
      return resolve(cachedRecord);
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
      if (this.get("browserDetect").ie()) {
        window.location.replace("/account_details");
        debugger;
      } else {
        this.transitionTo("account_details");
        debugger;
      }
    }
  }
});
