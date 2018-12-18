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
    if(orderId && orderId.length && transition.queryParams.editRequest === "true") {
      this.set("order", this.store.peekRecord("order", orderId));
    }
  },

  setUpFormData(model, controller) {
    let order = this.get("order");
    controller.set('selectedId', "organisation");
    controller.set('isEditing', false);

    if(order) {
      if(order.get("beneficiaryId")) {
        controller.set('selectedId', "client");
      }

      if(this.get("previousRouteName") === "my_orders") {
        this.controllerFor('my_orders').set("selectedOrder", order);
      } else {
        this.controllerFor('my_orders').set("selectedOrder", null);
      }

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
