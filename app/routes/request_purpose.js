import AuthorizeRoute from './authorize';

export default AuthorizeRoute.extend({
  setUpFormData(model, controller) {
    controller.set('selectedId', "organisation");
  },

  setupController(controller, model) {
    this._super(...arguments);
    this.setUpFormData(model, controller);
    this.controllerFor('application').set('showSidebar', false);
  },
  
  deactivate() {
    this.controllerFor('application').set('showSidebar', true);
  }
});
