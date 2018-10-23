import AuthorizeRoute from './authorize';

export default AuthorizeRoute.extend({
  model() {
    var orderId = this.paramsFor('order').order_id;
    var order = this.store.peekRecord('order', orderId);
  },
});
