import { inject as service } from "@ember/service";
import Component from "@ember/component";

export default Component.extend({
  session: service(),
  actions: {
    redirectAsPerUserDetails() {
      if (this.get("session").accountDetailsComplete()) {
        this.get("router").transitionTo("request_purpose", {
          queryParams: {
            bookAppointment: true,
            orderId: null,
            prevPath: null,
            editRequest: null
          }
        });
      } else {
        this.get("router").transitionTo("account_details", {
          queryParams: { bookAppointment: true, onlineOrder: false }
        });
      }
    }
  }
});
