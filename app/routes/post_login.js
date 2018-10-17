import Ember from 'ember';
import preloadDataMixin from '../mixins/preload_data';
import AjaxPromise from 'browse/utils/ajax-promise';

export default Ember.Route.extend(preloadDataMixin, {

  cart: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  isBookAppointment: false,

  beforeModel(params){
    this.set('isBookAppointment', params.queryParams.bookAppointment);
  },

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
            this.redirectToTransitionOrDetails();
          }).catch(xhr => {
            this.get("messageBox").alert(xhr.responseJSON.errors);
          });
      }
    } else {
      this.redirectToTransitionOrDetails();
    }
  },

  redirectToTransitionOrDetails() {
    if(this.isDetailsComplete()){
      var attemptedTransition = this.controllerFor('login').get('attemptedTransition');
      var isBookAppointment = this.get('isBookAppointment');
      if (attemptedTransition) {
        attemptedTransition.retry();
        this.controllerFor('login').set('attemptedTransition', null);
      } else if( isBookAppointment === "true"){
        console.log('abc');
        this.transitionTo("request_purpose");
      }
      else {
        this.transitionTo("browse");
      }
    } else {
      this.transitionTo("account_details");
    }
  },

  isDetailsComplete(){
    var user = this.get('session.currentUser');
    var organisationsUser = user.get('organisationsUsers') && user.get('organisationsUsers.firstObject');
    var organisation = organisationsUser && organisationsUser.get('organisation');

    if(organisation && user && organisationsUser && organisationsUser.get('isInfoComplete') && user.get('isInfoComplete')){
      return true;
    } else {
      return false;
    }
  }
});
