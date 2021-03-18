import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { computed } from "@ember/object";
import AsyncMixin from "browse/mixins/async_tasks";

export default Component.extend(AsyncMixin, {
  accountService: service(),
  store: service(),
  messageBox: service(),

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
      try {
        const data = await this.runTask(
          this.get("accountService").initiatePinFor(
            this.get("formattedMobileNumber"),
            this.get("session.currentUser.id")
          )
        );
        this.set("otpAuth", data.otp_auth_key);
        this.set("showPinInput", true);
      } catch (error) {
        this.get("messageBox").alert(error.responseJSON.error);
      }
    },

    async updatePhoneNumber() {
      try {
        const data = await this.runTask(
          this.get("accountService").updatePhoneNumber(
            this.get("session.currentUser.id"),
            {
              mobile: this.get("formattedMobileNumber"),
              otp_auth_key: this.get("otpAuth"),
              pin: this.get("pin")
            }
          )
        );
        this.get("model").set("mobile", data.user.mobile);
        this.send("cancelSearch");
      } catch (error) {
        this.get("messageBox").alert(error.responseJSON.errors[0].message.pin);
      }
    }
  }
});
