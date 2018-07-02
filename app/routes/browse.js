import PublicRoute from './browse_pages';

export default PublicRoute.extend({
  previousRoute: false,
  previousRouteName: null,

  beforeModel() {
    this._super(...arguments);
    var previousRoutes = this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();

    if(previousRoute)
    {
      this.set("previousRouteName", previousRoute.name);
      if(previousRoute.name === "cart") {
        this.set('previousRoute', true);
      }
    }
  },

  model() {
    return this.store.peekAll('package_category');
  },

  setupController(controller, model){
    if(this.get('previousRoute')) {
      controller.set('showCartDetailSidebar', false);
    }
    controller.set('model', model);
    controller.set("previousRouteName", this.get("previousRouteName"));
    controller.toggleProperty("triggerFlashMessage");
    this.controllerFor('application').set('pageTitle', this.get('i18n').t("browse.title"));
  }
});
