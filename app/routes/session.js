import Ember from 'ember';

export default Ember.Route.extend({

  beforeModel() {
    if (this.session.get('isLoggedIn')) {
      this.transitionTo('/');
    } else {
      this.set('cart.checkout', true);
    }
  }
});
