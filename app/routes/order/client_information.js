import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({
  model() {
    var orderId = this.paramsFor('order').order_id;
    return this.store.peekRecord('order', orderId);
  },

  setUpFormData(model, controller) {
    controller.set('selectedId', "hkId");
  },

  setupController(controller, model) {
    this._super(...arguments);
    this.setUpFormData(model, controller);
  }
});
