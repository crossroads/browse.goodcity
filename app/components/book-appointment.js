import Ember from "ember";

export default Ember.Component.extend({
	isDetailsComplete(){
    const user = this.get('session.currentUser');
    if (!user) { return false; }

    const organisationsUser = user.get('organisationsUsers.firstObject');
    const organisation = organisationsUser && organisationsUser.get('organisation');
    const hasInfoAndCharityRole = user.get('isInfoComplete') && user.hasRole('Charity');
    const hasCompleteOrganisationUserInfo = organisationsUser && organisationsUser.get('isInfoComplete');

    return hasInfoAndCharityRole && organisation && hasCompleteOrganisationUserInfo;
  },

	actions: {
	  redirectAsPerUserDetails(){
      if(this.isDetailsComplete()){
        this.get('router').transitionTo("request_purpose", { queryParams: { bookAppointment: true, orderId: null }});
      }
      else{
        this.get('router').transitionTo("account_details", { queryParams: { bookAppointment: true }});
      }
    }
	}
});
