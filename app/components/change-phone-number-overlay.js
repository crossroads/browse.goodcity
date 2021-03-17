import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { computed } from "@ember/object";

export default Component.extend({
  accountService: service(),
  store: service(),

  mobileNumber: "",

  formattedMobileNumber: computed("mobileNumber", function() {
    const mobile = this.get("mobileNumber");
    return `+852${mobile}`;
  }),

  actions: {
    cancelSearch() {
      this.get("accountService").setOverlayVisibility(false);
      this.set("mobileNumber", "");
      this.set("pin", "");
      this.set("showPinInput", false);
    },

    async initiateChange() {
      const data = await this.get("accountService").initiatePinFor(
        this.get("formattedMobileNumber"),
        this.get("session.currentUser.id")
      );
      this.set("otpAuth", data.otp_auth_key);
      this.set("showPinInput", true);
    },

    updatePhoneNumber() {
      this.get("accountService")
        .updatePhoneNumber(this.get("session.currentUser.id"), {
          mobile: this.get("formattedMobileNumber"),
          otp_auth_key: this.get("otpAuth"),
          pin: this.get("pin")
        })
        .then(response => {
          this.get("store").pushPayload(response.user);
          this.send("cancelSearch");
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
});
