import ApiService from "./api-base-service";

export default ApiService.extend({
  isOpen: false,

  setOverlayVisibility(val) {
    this.set("openPhoneOverlay", val);
  },

  initiatePinFor(mobile, userId) {
    return this.POST("/auth/send_pin", {
      mobile,
      user_id: userId
    });
  },

  updatePhoneNumber(userId, { mobile, otp_auth_key, pin }) {
    return this.PUT(`/users/${userId}/update_mobile_number`, {
      mobile,
      otp_auth_key,
      pin
    });
  }
});
