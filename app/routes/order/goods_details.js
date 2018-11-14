import Ember from 'ember';
import AuthorizeRoute from './../authorize';
import AjaxPromise from 'browse/utils/ajax-promise';

export default AuthorizeRoute.extend({
  backLinkPath: Ember.computed.localStorage(),

  queryParams: {
    fromClientInformation: false
  },

  beforeModel(){
    var previousRoutes = this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();
    if(previousRoute){
      var parentRoute = previousRoutes[1];
      var hasParentRoute = parentRoute && parentRoute.name === "order.client_information";
      var isSearchRoute = previousRoute.name === "code_search";
      if(!isSearchRoute && hasParentRoute) {
        this.set("backLinkPath", previousRoute.name);
      } else {
        this.set("backLinkPath", null);
      }
    }
  },

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
  },

  setupController(controller, model) {
    this._super(controller, model);
    if(this.get('backLinkPath') !== null) {
      controller.set('backLinkPath', this.get('backLinkPath'));
    } else {
      controller.set('backLinkPath', 'request_purpose');
    }
  }
});
