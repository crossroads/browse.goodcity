import PublicRoute from './browse_pages';
import Ember from 'ember';

export default PublicRoute.extend({
  messageBox: Ember.inject.service(),
  isAvailable: false,
  transition: null,

  beforeModel(transition) {
    this._super(...arguments);
    this.set('transition', transition);
  },

  model(params) {
    return this.store.peekRecord('item', params["id"]);
  },

  afterModel(model) {
    var isItemUnavailable = model.get('isUnavailableAndDesignated');
    if(isItemUnavailable && isItemUnavailable !== null) {
      this.get('transition').abort();
      this.get('messageBox').alert(this.get('i18n').t('cart_content.unavailable'),
      () => {
        this.transitionTo('/browse');
      });
    }
  },

  setupController(controller, model){
    controller.set('model', model);
    controller.set("previewUrl", model.get("previewImageUrl"));
    this.controllerFor('application').set('pageTitle',
      this.get('i18n').t("itemdetail.view"));
  }
});
