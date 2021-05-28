import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { computed } from "@ember/object";
import AsyncMixin from "browse/mixins/async_tasks";

export default Component.extend(AsyncMixin, {
  accountService: service(),
  store: service(),
  messageBox: service(),
  showPinInput: false,

  mobileNumber: "",

  formattedMobileNumber: computed("mobileNumber", function() {
    const mobile = this.get("mobileNumber");
    return `+852${mobile}`;
  }),

  willDestroyElement() {
    this.get("accountService").setOverlayVisibility(false);
    this.set("mobileNumber", "");
    this.set("pin", "");
    this.set("showPinInput", false);
  },

  actions: {
    cancel() {
      this.get("accountService").setOverlayVisibility(false);
      this.set("mobileNumber", "");
      this.set("pin", "");
      this.set("showPinInput", false);
    },

    async initiateChange() {
      try {
        const data = await this.runTask(
          this.get("accountService").initiatePinFor(
            this.get("formattedMobileNumber")
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
        const res = await this.runTask(
          this.get("accountService").updatePhoneNumber(
            this.get("session.currentUser.id"),
            {
              token: this.get("otpAuth"),
              pin: this.get("pin")
            }
          )
        );
        this.get("model").set("mobile", res.data.attributes.mobile);
        this.send("cancel");
      } catch (error) {
        this.get("messageBox").alert(error.responseJSON.error);
        this.send("cancel");
      }
    }
  }
});
