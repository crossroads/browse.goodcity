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
          });
      }
    }

    // After everthying has been loaded, redirect user to requested url
    var attemptedTransition = this.controllerFor('login').get('attemptedTransition');
    if (attemptedTransition) {
      attemptedTransition.retry();
      this.set('attemptedTransition', null);
    }
  }
});
