// import AuthorizeRoute from './authorize';
import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({

  queryParams: {
    backToNewItem: false
  },

  model() {
    // return this.store.query('package_type', { stock: true });
  },

  setupController(controller, model){
    this._super(controller, model);
    controller.set('searchText', "");
  }
});