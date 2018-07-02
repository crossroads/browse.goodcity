import Ember from 'ember';
import AuthorizeRoute from './authorize';

export default AuthorizeRoute.extend({
  previousRouteName: null,

  beforeModel() {
    this._super(...arguments);
    var previousRoutes = this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();

    if(previousRoute)
    {
      this.set("previousRouteName", previousRoute.name);
    }
    this.set('cart.checkout', false);
  },

  model() {
    return Ember.RSVP.hash({
      organisation: this.store.peekAll('organisation').objectAt(0),
      user: this.store.peekAll('user').objectAt(0),
      orders: this.store.peekAll('order')
    });
  },

  setupController(controller, model){
    this._super(controller, model);
    controller.set("previousRouteName", this.get("previousRouteName"));
    controller.toggleProperty("triggerFlashMessage");
  }
});
