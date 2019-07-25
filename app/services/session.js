import Ember from "ember";
import ApiService from "./api-base-service";
import "../computed/local-storage";

export default ApiService.extend({
  authToken: Ember.computed.localStorage(),
  otpAuthKey: Ember.computed.localStorage(),
  isLoggedIn: Ember.computed.notEmpty("authToken"),
  language: Ember.computed.localStorage(),
  store: Ember.inject.service(),
  deviceId: Math.random()
    .toString()
    .substring(2),

  loadUserProfile() {
    return this.GET("/auth/current_user_profile").then(data => {
      this.get("store").pushPayload(data);
      this.get("store").pushPayload({ user: data.user_profile });
      this.set("currentUserId", data.user_profile.id);
      return data;
    });
  },

  accountDetailsComplete() {
    const user = this.get("currentUser");
    if (!user) {
      return false;
    }

    const organisationsUser = user.get("organisationsUsers.firstObject");
    const organisation =
      organisationsUser && organisationsUser.get("organisation");
    const hasInfoAndCharityRole =
      user.get("isInfoComplete") && user.hasRole("Charity");
    const hasCompleteOrganisationUserInfo =
      organisationsUser && organisationsUser.get("isInfoComplete");

    return (
      hasInfoAndCharityRole && organisation && hasCompleteOrganisationUserInfo
    );
  },

  currentUserId: null,

  currentUser: Ember.computed("currentUserId", function() {
    if (!this.get("authToken") || !this.get("currentUserId")) {
      return null;
    }
    return this.get("store").peekRecord("user", this.get("currentUserId"));
  }),

  clear() {
    this.set("currentUserId", null);
    this.set("authToken", null);
    this.set("otpAuthKey", null);
  }
});
