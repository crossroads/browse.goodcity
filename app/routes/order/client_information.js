import Ember from 'ember';
import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({
  model() {
    var orderId = this.paramsFor('order').order_id;
    var order = this.store.peekRecord('order', orderId);

    return Ember.RSVP.hash({
      order: order,
      beneficiary: order.get('beneficiary')
    });
  },

  setUpFormData(model, controller) {
    var selectedId = "hkId";
    var beneficiary = model.beneficiary
    if(beneficiary){
      var phoneNumber = beneficiary.get('phoneNumber').slice(4);
      selectedId = beneficiary.get('identityTypeId') === 1 ? "hkId" : "abcl";
      controller.set('firstName', beneficiary.get('firstName'));
      controller.set('lastName', beneficiary.get('lastName'));
      controller.set('mobilePhone', phoneNumber);
      controller.set('identityNumber', beneficiary.get('identityNumber'));
    }
    controller.set('selectedId', selectedId);
  },

  setupController(controller, model) {
    this._super(...arguments);
    this.setUpFormData(model, controller);
  }
});
