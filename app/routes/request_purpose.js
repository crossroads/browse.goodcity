import AuthorizeRoute from './authorize';

export default AuthorizeRoute.extend({
  orderId: null,
  order: null,
  previousRouteName: null,

  beforeModel(transition) {
    this._super(...arguments);
    var previousRoutes = this.router.router && this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();

    if(previousRoute && previousRoute.name)
    {
      this.set("previousRouteName", previousRoute.name);
    }

    const orderId = transition.queryParams.orderId;
    const isMyOrdersPreviousRoute = this.get('previousRouteName') === 'my_orders';
    if(orderId && orderId.length && transition.queryParams.editRequest === "true") {
      this.set("order", this.store.peekRecord("order", orderId));
    } else if (!isMyOrdersPreviousRoute){
      const sortedOrders = this.store.peekAll('order').sortBy('id');
      this.set("order", sortedOrders.filterBy("detailType", "GoodCity").filterBy("state", "draft").filterBy('orderType', 'appointment').get("lastObject"));
    }
  },

  model(){
    return this.get('order');
  },

  setUpFormData(model, controller) {
    let order = this.get("order");
    
    controller.set('isEditing', false);

    if(order) {
      let ordersPurposes = order.get('ordersPurposes');

      if(ordersPurposes.get('length')){
        controller.set('selectedId', ordersPurposes.get('firstObject').get('purpose.identifier'));
      } else{
        controller.set('selectedId',  "organisation");
      }

      if(this.get("previousRouteName") === "my_orders") {
        this.controllerFor('my_orders').set("selectedOrder", order);
      } else {
        this.controllerFor('my_orders').set("selectedOrder", null);
      }

      controller.set('selectedDistrict', order.get('district'));
      controller.set('peopleCount', order.get("peopleHelped"));
      controller.set('description', order.get("purposeDescription"));
      controller.set('isEditing', true);
    }
  },

  setupController(controller, model) {
    this._super(...arguments);
    controller.set("previousRouteName", this.get("previousRouteName"));
    this.setUpFormData(model, controller);
    this.controllerFor('application').set('showSidebar', false);
  },

  deactivate() {
    this.controllerFor('application').set('showSidebar', true);
  }
});
