import AuthorizeRoute from './../authorize';
import AjaxPromise from 'browse/utils/ajax-promise';

export default AuthorizeRoute.extend({
  model() {
    var orderId = this.paramsFor('order').order_id;
    var order = this.store.peekRecord('order', orderId);
    var goodcityRequestParams = {};
    goodcityRequestParams['quantity'] = 1;
    goodcityRequestParams['order_id'] = orderId;

    if (!(order.get('goodcityRequests').length)){
    	new AjaxPromise("/goodcity_requests", "POST", this.get('session.authToken'), {  goodcity_request: goodcityRequestParams })
      .then(data => {
        this.get("store").pushPayload(data);
      }).catch(xhr => {
        this.get("messageBox").alert(xhr.responseJSON.errors);
      });
    }
    return order;
  }
});
