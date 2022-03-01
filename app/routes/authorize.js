import { resolve } from "rsvp";
import Route from "@ember/routing/route";

export default Route.extend({
  queryParams: { bookAppointment: "false" },
  beforeModel(params) {
    this.set("queryParams", params.queryParams);
  },

  loadIfAbsent(modelName, id) {
    let store = this.get("store");
    let cachedRecord = store.peekRecord(modelName, id);
    if (cachedRecord) {
      return resolve(cachedRecord);
    }
    return store.findRecord(modelName, id, { reload: true });
  },

  beforeModel(transition) {
    if (!this.session.get("isLoggedIn")) {
      transition.abort();
      var queryParams = this.get("queryParams");
      var loginController = this.controllerFor("login");
      loginController.set("attemptedTransition", transition);
      this.transitionTo("login", { queryParams: queryParams });
      return false;
    }
    return true;
  }
});
