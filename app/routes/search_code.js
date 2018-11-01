import AuthorizeRoute from './authorize';

export default AuthorizeRoute.extend({

  queryParams: {
    backToNewItem: false
  },

  model() {
    // return this.store.query('code', { stock: true });
  },

  setupController(controller, model){
    this._super(controller, model);
    controller.set('searchText', "");
  }
});