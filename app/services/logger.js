import Ember from "ember";
import config from "../config/environment";

export default Ember.Service.extend({
  session: Ember.inject.service(),
  rollbar: Ember.inject.service(),

  raiseError: function(errorData, currentUser) {
    this.set("rollbar.currentUser", currentUser);
    this.get("rollbar").error(this.getError(reason), (data = errorData));
  },

  error: function(reason) {
    if (reason.status === 0) {
      return;
    }
    console.info(reason);
    if (config.environment === "production" || config.staging) {
      var data;
      let currentUser = this.get("session.currentUser");
      let userName = currentUser && currentUser.get("fullName");
      let userId = currentUser && currentUser.get("id");
      let environment = config.staging ? "staging" : config.environment;
      let errorData = {
        id: userId,
        username: userName,
        environment: environment
      };
      this.raiseError(errorData, currentUser);
    }
  },

  getError: function(reason) {
    return reason instanceof Error || typeof reason !== "object"
      ? reason
      : JSON.stringify(reason);
  }
});
