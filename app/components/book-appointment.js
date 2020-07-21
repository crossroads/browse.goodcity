import { inject as service } from "@ember/service";
import { computed } from "@ember/object";
import Component from "@ember/component";

export default Component.extend({
  session: service(),
  settings: service(),

  allowAppointments: computed(function() {
    return this.get("settings").readBoolean("browse.allow_appointments");
  }),

  disabled: computed.not("allowAppointments"),

  actions: {
    redirectAsPerUserDetails() {
      if (this.get("session").accountDetailsComplete()) {
        this.get("router").transitionTo("request_purpose", {
          queryParams: {
            bookAppointment: true,
            orderId: null,
            prevPath: this.get("prevPath") || null,
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
