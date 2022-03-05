import Ember from "ember";
import config from "../config/environment";

export default Ember.Service.extend({
  session: Ember.inject.service(),
  rollbar: Ember.inject.service(),

  notifyErrorCollector(reason) {
    var currentUser = this.get("session.currentUser");
    var userName = currentUser.get("fullName");
    var userId = currentUser.get("id");
    var error =
      reason instanceof Error || typeof reason !== "object"
        ? reason
        : JSON.stringify(reason);
    var environment = config.environment;
    this.set("rollbar.currentUser", currentUser);
    this.get("rollbar").error(error, {
      id: userId,
      username: userName,
      environment: environment
    });
  },

  error(reason) {
    if (reason.status === 0) return;
    console.info(reason);
    this.notifyErrorCollector(reason);
  }
});
