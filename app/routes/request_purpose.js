import AuthorizeRoute from './authorize';
import Ember from 'ember';

export default AuthorizeRoute.extend({
  orderId: null,
  order: null,
  previousRouteName: null,
  isBookAppointment: null,
  session: Ember.inject.service(),

  beforeModel(transition) {
    if (!this._super(...arguments)) {
      return; // not authorized
    }

    let previousRoutes  = this.router.router && this.router.router.currentHandlerInfos;
    let previousRoute   = previousRoutes && previousRoutes.pop();
    let isAppointment   = transition.queryParams.bookAppointment === 'true';
    let editRequest     = transition.queryParams.editRequest === 'true';

    if(previousRoute && previousRoute.name) {
      this.set("previousRouteName", previousRoute.name);
    }

    this.set('editRequest', editRequest);
    this.set('isBookAppointment', isAppointment);

    const orderId = transition.queryParams.orderId;
    if (orderId) {
      this.set("order", this.store.peekRecord("order", orderId));
    } else {
      this.set("order", this.get(`session.${isAppointment ? 'draftAppointment' : 'draftOrder'}`));
    }
  },

  model(){
    return this.get('order');
  },

  setUpFormData(model, controller) {
    let order = this.get("order");
    
    if(!order) {
      controller.set('selectedDistrict', null);
      controller.set('peopleCount', null);
      controller.set('description', null);
      controller.set('selectedId',  "organisation");
      return;
    }

    let ordersPurposes = order.get('ordersPurposes');

    if (ordersPurposes.get('length')){
      controller.set('selectedId', ordersPurposes.get('firstObject').get('purpose.identifier'));
    }

    controller.set('selectedDistrict', order.get('district'));
    controller.set('peopleCount', order.get("peopleHelped"));
    controller.set('description', order.get("purposeDescription"));
    controller.set('isEditing', !order.get('isDraft'));
  },

  setupController(controller, model, transition) {
    this._super(...arguments);
    controller.set("previousRouteName", this.get("previousRouteName"));
    controller.set('isEditing', false);
    this.setUpFormData(model, controller, transition);
    this.controllerFor('application').set('showSidebar', false);
    controller.set("model", this.get('order'));
  },

  deactivate() {
    this.controllerFor('application').set('showSidebar', true);
  }
});
