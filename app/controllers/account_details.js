import Ember from "ember";
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Controller.extend({
  authenticate:Ember.inject.controller(),
  messageBox: Ember.inject.service(),
  organisationId: Ember.computed.alias('model.organisation.id'),
  organisationsUserId: Ember.computed.alias('model.organisationsUser.id'),

  clearFormData() {
    this.set('organisationName', "");
    this.set('firstName', "");
    this.set('lastName', "");
    this.set('mobile', "");
    this.set('email', "");
    this.set('title', "");
    this.set('position', "");
  },

  actions: {
    saveAccount() {
      var loadingView = getOwner(this).lookup('component:loading').append();
      var mobilePhone = this.get('model.user.mobile');
      var firstName = this.get('model.user.firstName');
      var lastName = this.get('model.user.lastName');
      var organisationId = this.get('organisationId');
      var position = this.get('model.organisationsUser.position');
      var email = this.get('model.user.email');
      new AjaxPromise("/organisations_users", "POST", this.get('session.authToken'), { organisations_user: {
        organisation_id: organisationId, position: position, user_attributes: { first_name: firstName,
        last_name: lastName, mobile: mobilePhone, email: email }}}).then(data =>{
          this.get("store").pushPayload(data);
          this.clearFormData();
          var attemptedTransition = this.get('authenticate').get('attemptedTransition');
          if (attemptedTransition) {
            this.set('attemptedTransition', null);
            attemptedTransition.retry();
          }else{
            this.transitionToRoute("browse");
          }
      }).catch(xhr => {
        if (xhr.status === 422) {
          this.get("messageBox").alert(xhr.responseJSON.errors);
        } else {
          throw xhr;
        }
      })
      .finally(() =>
        loadingView.destroy()
      );
    }
  }
});
