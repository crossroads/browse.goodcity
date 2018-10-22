import AuthorizeRoute from './authorize';
import Ember from 'ember';

export default AuthorizeRoute.extend({
  setUpFormData(model, controller) {
    controller.set('selectedId', "hkId");
  },

  setupController(controller, model) {
    this._super(...arguments);
    this.setUpFormData(model, controller);
  }
});
