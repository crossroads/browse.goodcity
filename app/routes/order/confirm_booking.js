import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({
	model() {
    var orderId = this.paramsFor('order').order_id;
    return this.store.peekRecord('order', orderId) || this.store.findRecord('order', orderId);
  },

  setupController() {
    this._super(...arguments);
    this.controllerFor('application').set('showSidebar', false);
  },

  deactivate(){
    this.controllerFor('application').set('showSidebar', true);
  }
});