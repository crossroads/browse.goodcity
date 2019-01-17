import Ember from 'ember';
import AuthorizeRoute from './authorize';

export default AuthorizeRoute.extend({
  orderId: null,
  editRequest: null,

  model() {
    return Ember.RSVP.hash({
      organisation: this.store.peekAll('organisation').objectAt(0),
      user: this.store.peekAll('user').objectAt(0)
    });
  },

  getOrder(transition){
    if(transition.queryParams){
      const orderId = transition.queryParams.orderId;
      if(orderId && orderId.length && transition.queryParams.editRequest) {
        return this.store.peekRecord("order", orderId);
      } 
    } else {
      return this.get("store").peekAll("order").filterBy("state", "draft").get("firstObject");
    }
  },

  setupController(controller, transition) {
    var order = this.getOrder(transition);
    if(order) {
      controller.set("description", order.get("purposeDescription"));
      var purpose_ids = order.get("ordersPurposes").filterBy("orderId", parseInt(order.id)).getEach("purposeId");
      purpose_ids.forEach(id => {
        switch (id) {
          case 1:
            controller.set("organisation", true);
            break;
          case 2:
            controller.set("client", true);
            break;
          case 3:
            controller.set("trade", true);
            break;
        }
      });
    } else {
      controller.set("description", "");
      controller.set("organisation", false);
      controller.set("client", false);
      controller.set("trade", false);
    }
    this._super(...arguments);
    controller.set('blankPurpose', false);
  }

});
