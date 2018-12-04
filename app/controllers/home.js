import applicationController from './application';
import config from "../config/environment";

export default applicationController.extend({
  isMobileApp: config.cordova.enabled,

  isDetailsComplete(){
    const user = this.get('session.currentUser');
    if (!user) { return false; }

    const organisationsUser = user.get('organisationsUsers.firstObject');
    const organisation = organisationsUser && organisationsUser.get('organisation');
    const userInfoComplete = user.get('isInfoComplete') && user.hasRole('Charity');
    const organisationUserComplete = organisationsUser && organisationsUser.get('isInfoComplete');

    return (userInfoComplete && organisation && organisationUserComplete);
  },

  actions: {
    redirectAsPerUserDetails(){
      if(this.isDetailsComplete){
        this.transitionToRoute("request_purpose");
      }
      else{
        this.transitionToRoute("account_details", { queryParams: { bookAppointment: true}});
      }
    },
  }
});
