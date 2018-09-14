import Ember from 'ember'
import PublicRoute from './browse_pages';

export default Ember.Route.extend({

    beforeModel() {
        this.set('cart.checkout', false);
    }

});
