import detail from './detail';
import Ember from 'ember';

export default detail.extend({
  model(params) {
    return Ember.RSVP.hash({
      order: (this.store.peekRecord("order", params.order_id, {
        reload: true
      }) || this.store.findRecord('order', params.order_id)),
      messages: this.store.query('message', {
        order_id: params.order_id
      })
    });
  },

  afterModel(model) { //jshint ignore:line
    //Overriding to neglect afterModel in detail
  },

  setupController(controller, model) {
    controller.set("model", model.order);
    controller.send('markRead');
    this.controllerFor("application").set('hideHeaderBar', true);
  }
});
