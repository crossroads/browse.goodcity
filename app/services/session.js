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
      this.notifyPropertyChange("currentUser");
      return data;
    });
  },

  currentUser: Ember.computed(function() {
    var store = this.get("store");
    return (
      this.get("store")
        .peekAll("user")
        .get("firstObject") || null
    );
  }).volatile(),

  clear() {
    this.set("authToken", null);
    this.set("otpAuthKey", null);
  }
});
