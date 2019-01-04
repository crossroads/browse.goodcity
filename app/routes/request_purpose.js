import AuthorizeRoute from './authorize';

export default AuthorizeRoute.extend({
  orderId: null,
  order: null,
  previousRouteName: null,
  isBookAppointment: null,

  beforeModel(transition) {
    this._super(...arguments);
    var previousRoutes = this.router.router && this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();

    if(previousRoute && previousRoute.name)
    {
      this.set("previousRouteName", previousRoute.name);
    }

    if(transition.queryParams.bookAppointment === 'true'){
      this.set('isBookAppointment', true);
    }

    const orderId = transition.queryParams.orderId;
    if(orderId && orderId.length && !this.get('isBookAppointment')) {
      this.set("order", this.store.peekRecord("order", orderId));
    } else if ( transition.queryParams.bookAppointment === 'true'){
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

      if(this.get("previousRouteName") === "my_orders" && !this.get('isBookAppointment')) {
        this.controllerFor('my_orders').set("selectedOrder", order);
      } else {
        this.controllerFor('my_orders').set("selectedOrder", null);
      }

      controller.set('selectedDistrict', order.get('district'));
      controller.set('peopleCount', order.get("peopleHelped"));
      controller.set('description', order.get("purposeDescription"));
      controller.set('isEditing', true);
    } else {
      controller.set('selectedDistrict', null);
      controller.set('peopleCount', null);
      controller.set('description', null);
    }
  },

  setupController(controller, model, transition) {
    this._super(...arguments);
    controller.set("previousRouteName", this.get("previousRouteName"));
    this.setUpFormData(model, controller, transition);
    this.controllerFor('application').set('showSidebar', false);
    this.set('order', null);
  },

  deactivate() {
    this.controllerFor('application').set('showSidebar', true);
  }
});
