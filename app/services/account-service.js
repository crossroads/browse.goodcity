import ApiService from "./api-base-service";

export default ApiService.extend({
  isOpen: false,

  setOverlayVisibility(val) {
    this.set("openPhoneOverlay", val);
  },

  initiatePinFor(mobile) {
    return this.POST(
      "/auth/resend_pin",
      {
        mobile
      },
      { version: "2" }
    );
  },

  updatePhoneNumber(userId, { token, pin }) {
    return this.PUT(
      `/users/${userId}/update_phone_number`,
      {
        token,
        pin
      },
      {
        version: "2"
      }
    );
  }
});
