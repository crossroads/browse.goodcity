import Ember from 'ember';
import preloadDataMixin from '../mixins/preload_data';
import AjaxPromise from 'browse/utils/ajax-promise';

export default Ember.Route.extend(preloadDataMixin, {

  cart: Ember.inject.service(),

  model() {
    return this.preloadData();
  },

  afterModel() {
    var ordersPackages = [];
    var package_ids = [];
    // Merging Offline cart items with Order in draft state
    var draftOrder = this.store.peekAll("order").filterBy("state", "draft").get("firstObject");
    if (draftOrder) {
      ordersPackages = draftOrder.get("ordersPackages");
    }
    if (draftOrder && ordersPackages.length) {
      ordersPackages.forEach(ordersPackage => {
        this.get('cart').pushItem(ordersPackage.get('package'));
      });

      if (draftOrder) {
        this.get("cart.cartItems").forEach(record => {
          if(record) {
            var ids = record.get("isItem") ? record.get("packages").getEach("id") : [record.get("id")];
            package_ids = package_ids.concat(ids);
          }
        });

        var orderParams = {
          cart_package_ids: package_ids
        };

        new AjaxPromise(`/orders/${draftOrder.id}`, "PUT", this.get('session.authToken'), { order: orderParams })
          .then(data => {
            this.get("store").pushPayload(data);
            this.transitionTo("account_details");
          });
      }
    }

    if(this.isDetailsComplete()){
      var attemptedTransition = this.controllerFor('login').get('attemptedTransition');
      if (attemptedTransition) {
        this.set('attemptedTransition', null);
        attemptedTransition.retry();
      }else{
        this.transitionToRoute("browse");
      }
    }else{
      this.transitionTo("account_details");
    }
  },

  isDetailsComplete(){
    var organisation = this.store.peekAll('organisation').objectAt(0);
    var organisationsUser = this.store.peekAll('organisations_user').objectAt(0);
    var user = this.store.peekAll('user').objectAt(0);
    if(organisation && user && organisationsUser && organisationsUser.get('isInfoComplete') && user.get('isInfoComplete')){
      return true;
    }else{
      return false;
    }
  }
});
