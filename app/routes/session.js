import Ember from 'ember';

export default Ember.Route.extend({

  beforeModel() {
    // this.controller.set('bookingAppointment', params['bookingAppointment']);
    if (this.session.get('isLoggedIn')) {
      this.transitionTo('/');
    } else {
      this.set('cart.checkout', true);
    }
  }
});
