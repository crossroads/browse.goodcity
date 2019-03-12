import Ember from "ember";
import config from "../config/environment";

export default Ember.Service.extend({
  session: Ember.inject.service(),
  rollbar: Ember.inject.service(),

  error: function(reason) {
    if (reason.status === 0) {
      return;
    }
    console.info(reason);
    if (config.environment === "production" || config.staging) {
      var data;
      var currentUser = this.get("session.currentUser");
      var userName = currentUser.get("fullName");
      var userId = currentUser.get("id");
      var error = this.getError(reason);
      var environment = config.staging ? "staging" : config.environment;
      this.set("rollbar.currentUser", currentUser);
      this.get("rollbar").error(
        error,
        (data = { id: userId, username: userName, environment: environment })
      );
    }
  },

  getError: function(reason) {
    return reason instanceof Error || typeof reason !== "object"
      ? reason
      : JSON.stringify(reason);
  }
});
