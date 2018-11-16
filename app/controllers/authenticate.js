import Ember from 'ember';
import AjaxPromise from './../utils/ajax-promise';
import config from '../config/environment';
const { getOwner } = Ember;

export default Ember.Controller.extend({
  queryParams: ['bookAppointment'],
  messageBox: Ember.inject.service(),
  application: Ember.inject.controller(),
  attemptedTransition: null,
  bookAppointment: false,
  pin: "",
  mobilePhone: "",

  mobile: Ember.computed('mobilePhone', function(){
    return config.APP.HK_COUNTRY_CODE + this.get('mobilePhone');
  }),

  actions: {

    authenticateUser(bookAppointment) {
      Ember.$('.auth_error').hide();
      var pin = this.get('pin');
      var otp_auth_key = this.get('session.otpAuthKey');
      var _this = this;

      var loadingView = getOwner(this).lookup('component:loading').append();
      new AjaxPromise("/auth/verify", "POST", null, {pin: pin, otp_auth_key: otp_auth_key})
        .then(function(data) {
          _this.setProperties({pin:null});
          _this.set('session.authToken', data.jwt_token);
          _this.set('session.otpAuthKey', null);
          _this.store.pushPayload(data.user);
          _this.setProperties({pin: null});
          _this.get("application").set('loggedInUser', true);
          _this.transitionToRoute('post_login' , {
            queryParams: { bookAppointment: bookAppointment }
          });
        })
        .catch(function(jqXHR) {
          Ember.$('#pin').closest('div').addClass('error');
          _this.setProperties({pin: null});
          if (jqXHR.status === 422 && jqXHR.responseJSON.errors && jqXHR.responseJSON.errors.pin) {
            _this.get("messageBox").alert(jqXHR.responseJSON.errors.pin);
          }
          console.log("Unable to authenticate");
        })
        .finally(() => loadingView.destroy());
    },

    resendPin() {
      var mobile = this.get('mobile');
      var loadingView = getOwner(this).lookup('component:loading').append();
      var _this = this;
      var user_auth = { mobile: mobile,
                        address_attributes: {
                          district_id: null,
                          address_type: null
                        }
                      };

      new AjaxPromise("/auth/signup", "POST", null, {user_auth: user_auth})
        .then(data => {
          this.set('session.otpAuthKey', data.otp_auth_key);
          this.setProperties({pin:null});
          this.transitionToRoute('authenticate', { queryParams: { bookAppointment: this.get('bookAppointment') }});
        })
        .catch(error => {
          if([401].indexOf(error.status) >= 0) {
             _this.get("messageBox").alert(this.get('i18n').t('unauthorized'), () => {
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
