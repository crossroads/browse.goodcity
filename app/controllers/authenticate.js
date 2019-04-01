import Ember from "ember";
import AjaxPromise from "./../utils/ajax-promise";
import config from "../config/environment";
const { getOwner } = Ember;

export default Ember.Controller.extend({
  queryParams: ["bookAppointment"],
  messageBox: Ember.inject.service(),
  application: Ember.inject.controller(),
  attemptedTransition: null,
  bookAppointment: false,
  pin: "",
  mobileOrEmail: "",
  mobile: "",
  email: "",

  pinFor: Ember.computed("email", "mobile", function() {
    if (this.get("email")) {
      return "email";
    } else if (this.get("mobile")) {
      return "mobile";
    }
  }),

  setMobileOrEmail() {
    if (/^[569]\d{7}/.test(this.get("mobileOrEmail"))) {
      this.set("mobile", "+852" + this.get("mobileOrEmail"));
    } else {
      this.set("email", this.get("mobileOrEmail"));
    }
  },

  actions: {
    authenticateUser(bookAppointment) {
      Ember.$(".auth_error").hide();
      var pin = this.get("pin");
      var pin_for = this.get("pinFor");
      var otp_auth_key = this.get("session.otpAuthKey");
      var _this = this;

      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      new AjaxPromise("/auth/verify", "POST", null, {
        pin: pin,
        otp_auth_key: otp_auth_key,
        pin_for: pin_for
      })
        .then(function(data) {
          _this.setProperties({
            pin: null
          });
          _this.set("session.authToken", data.jwt_token);
          _this.set("session.otpAuthKey", null);
          _this.store.pushPayload(data.user);
          _this.setProperties({
            pin: null
          });
          _this.get("application").set("loggedInUser", true);
          _this.transitionToRoute("post_login", {
            queryParams: {
              bookAppointment: bookAppointment
            }
          });
        })
        .catch(function(jqXHR) {
          Ember.$("#pin")
            .closest("div")
            .addClass("error");
          _this.setProperties({
            pin: null
          });
          if (
            jqXHR.status === 422 &&
            jqXHR.responseJSON.errors &&
            jqXHR.responseJSON.errors.pin
          ) {
            _this.get("messageBox").alert(jqXHR.responseJSON.errors.pin);
          }
          console.log("Unable to authenticate");
        })
        .finally(() => loadingView.destroy());
    },

    resendPin() {
      this.setMobileOrEmail();
      var mobile = this.get("mobile");
      var email = this.get("email");
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      var _this = this;
      var user_auth = {
        mobile: mobile,
        email: email,
        address_attributes: {
          district_id: null,
          address_type: null
        }
      };
      new AjaxPromise(
        "/auth/signup",
        "POST",
        _this.get("session.authToken"),
        {
          user_auth: user_auth
        },
        null,
        _this.get("session.language")
      )
        .then(data => {
          this.set("session.otpAuthKey", data.otp_auth_key);
          this.set("session.loginPage", false);
          this.setProperties({
            pin: null
          });
          this.transitionToRoute("authenticate", {
            queryParams: {
              bookAppointment: this.get("bookAppointment")
            }
          });
        })
        .catch(error => {
          if ([401].indexOf(error.status) >= 0) {
            _this
              .get("messageBox")
              .alert(this.get("i18n").t("unauthorized"), () => {
                _this.transitionToRoute("/");
              });
          } else if ([422, 403].indexOf(error.status) >= 0) {
            _this.get("messageBox").alert(error.responseJSON.errors);
          }
          throw error;
        })
        .finally(() => loadingView.destroy());
    }
  }
});
