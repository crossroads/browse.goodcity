import Ember from 'ember';
import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({
  previousRouteName: null,

  beforeModel() {
    this._super(...arguments);
    var previousRoutes = this.router.router && this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();

    if(previousRoute && previousRoute.name)
    {
      this.set("previousRouteName", previousRoute.name);
    }
  },

  model() {
    var orderId = this.paramsFor('order').order_id;
    var order = this.store.peekRecord('order', orderId) || this.store.findRecord('order', orderId);

    return Ember.RSVP.hash({
      order: order,
      beneficiary: order.get('beneficiary'),
      purposes: this.store.peekAll('purpose')
    });
  },

  setUpFormData(model, controller) {
    var selectedId = "hkId";
    var beneficiary = model.beneficiary;
    controller.set('isEditing', false);
    controller.set('firstName', "");
    controller.set('lastName', "");
    controller.set('mobilePhone', "");
    controller.set('identityNumber', "");
    if(beneficiary){
      var phoneNumber = beneficiary.get('phoneNumber').slice(4);
      selectedId = beneficiary.get('identityTypeId') === 1 ? "hkId" : "abcl";
      controller.set('firstName', beneficiary.get('firstName'));
      controller.set('lastName', beneficiary.get('lastName'));
      controller.set('mobilePhone', phoneNumber);
      controller.set('identityNumber', beneficiary.get('identityNumber'));
    }
    controller.set('isEditing', !model.order.get('isDraft'));
    controller.set('selectedId', selectedId);
  },

  setupController(controller, model) {
    this._super(...arguments);
    this.setUpFormData(model, controller);
    controller.set("previousRouteName", this.get("previousRouteName"));
    if(this.get("previousRouteName") === "my_orders") {
      this.controllerFor('my_orders').set("selectedOrder", model.order);
    } else {
      this.controllerFor('my_orders').set("selectedOrder", null);
    }
    this.controllerFor('application').set('showSidebar', false);
  },

  deactivate(){
    this.controllerFor('application').set('showSidebar', true);
  }
});
