import Service, { inject as service } from "@ember/service";
import config from "../config/environment";

export default Service.extend({
  session: service(),
  rollbar: service(),

  raiseError(errorData, reason, currentUser) {
    let data;
    this.set("rollbar.currentUser", currentUser);
    this.get("rollbar").error(this.getError(reason), (data = errorData));
  },

  error(reason) {
    if (reason.status === 0) {
      return;
    }
    console.info(reason);
    if (config.environment === "production" || config.staging) {
      let currentUser = this.get("session.currentUser");
      let userName = currentUser && currentUser.get("fullName");
      let userId = currentUser && currentUser.get("id");
      let environment = config.staging ? "staging" : config.environment;
      let errorData = {
        id: userId,
        username: userName,
        environment: environment
      };
      this.raiseError(errorData, reason, currentUser);
    }
  },

  getError(reason) {
    return reason instanceof Error || typeof reason !== "object"
      ? reason
      : JSON.stringify(reason);
  }
});
