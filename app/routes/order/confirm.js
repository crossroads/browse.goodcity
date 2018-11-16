import Ember from 'ember';
import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({

  beforeModel(transition) {
    var path;
    var routerInfo = this.router.router.currentHandlerInfos;
    if(routerInfo){
      path = routerInfo.pop();
    }
    if(transition && path && path.name === "my_orders") {
      transition.abort();
      this.transitionTo('/browse');
    }
  },

  model() {
    var orderId = this.paramsFor('order').order_id;
    var order = this.store.peekRecord('order', orderId);

    return Ember.RSVP.hash({
      organisation: this.store.peekAll('organisation').objectAt(0),
      user: this.store.peekAll('user').objectAt(0),
      order: order || this.store.findRecord('order', orderId)
    });
  }
});
