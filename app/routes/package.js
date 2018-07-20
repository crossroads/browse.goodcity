import Ember from 'ember';
import PublicRoute from './browse_pages';

export default PublicRoute.extend({
  messageBox: Ember.inject.service(),
  isPublished: null,
  transition: null,

  beforeModel(transition) {
    this._super(...arguments);
    this.set('transition', transition);
    this.set('isPublished', null);
  },

  model(params, transition) {
    var pkg = this.store.peekRecord('package', params["id"]);
    if(!pkg || !pkg.get("quantity") || !pkg.get('isAvailable')) {
      this.set('isPublished', false);
    } else {
      this.set('isPublished', true);
    }
    this.set('transition', transition);
    return pkg;
  },

  renderTemplate() {
    this.render('item', {controller: 'package'});
  },

  setupController(controller, model){
    controller.set('model', model);
    controller.set('item', model);
    controller.set("previewUrl", model.get("previewImageUrl"));
    this.controllerFor('application').set('pageTitle',
      this.get('i18n').t("itemdetail.view"));
  },

  afterModel() {
    if(this.get('isPublished') !== null && !this.get('isPublished')) {
      this.get('transition').abort();
      this.get('messageBox').alert(this.get('i18n').t('cart_content.unavailable'),
        () => {
          this.transitionTo('/browse');
        });
    }
  }
});
