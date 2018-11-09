// import AuthorizeRoute from './authorize';
import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({
  model() {
    var orderId = this.paramsFor('order').order_id;
    return this.store.peekRecord('order', orderId);
  }
});