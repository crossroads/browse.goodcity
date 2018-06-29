import Ember from 'ember';
import AjaxPromise from 'browse/utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Controller.extend({

  subscription: Ember.inject.controller(),
  messageBox: Ember.inject.service(),
  loggedInUser: false,
  i18n: Ember.inject.service(),

  initSubscription: Ember.on('init', function() {
    this.get('subscription').send('wire');
  }),

  displayCart: false,
  showCartDetailSidebar: false,
  cartscroll: Ember.inject.service(),

  hasCartItems: Ember.computed.alias('cart.isNotEmpty'),
  cartLength: Ember.computed.alias('cart.counter'),

  draftOrder: Ember.computed.alias('session.draftOrder'),

  isUserLoggedIn: Ember.computed('loggedInUser', function() {
    this.set('loggedInUser', false);
    let authToken = window.localStorage.authToken;
    return authToken ? true : false;
  }),

  actions: {
    cancelOrderPopUp(orderId) {
      this.get("messageBox").custom(this.get("i18n").t("order.order_delete_confirmation"),
        this.get("i18n").t("order.cancel_order"),
        () => {
          this.send("cancelOrder", orderId);
        },
        this.get("i18n").t("not_now")
        );
    },

    cancelOrder(orderId) {
      var _this = this;
      var order = _this.store.peekAll("order").filterBy("state", "draft").get("firstObject");
      if(order) {
        var loadingView = getOwner(this).lookup('component:loading').append();
        new AjaxPromise("/orders/" + orderId, "DELETE", _this.get('session.authToken'))
        .then(data => {
          _this.get("cart").clearItems();
          if(order) {
            _this.store.unloadRecord(order);
          }
          _this.store.pushPayload(data);
          loadingView.destroy();
          _this.transitionToRoute("index", { queryParams:
            {
              orderCancelled: true
            }
          });
        });
      }
    },

    logMeOut() {
      this.session.clear(); // this should be first since it updates isLoggedIn status
      this.set('loggedInUser', "");
      this.get("cart").clearItems();
      this.store.unloadAll('order');
      this.store.unloadAll('orders_package');
      this.transitionToRoute('browse');
    },

    displayCart() {
      this.set('showCartDetailSidebar', true);
      this.toggleProperty('displayCart');
      Ember.run.later(this, function() {
        this.get('cartscroll').resize();
      }, 0);
    },

    showCartItem(itemId, type) {
      var item = this.get('store').peekRecord(type, itemId);
      this.transitionToRoute(type, itemId,
        { queryParams:
          {
            categoryId: item.get("allPackageCategories.firstObject.id")
          }
        });
    },

    removeItem(itemId, type) {
      var item = this.get('store').peekRecord(type, itemId);
      var ordersPackages = this.store.peekAll('orders_package');
      var orderPackageId;
      if(this.get('draftOrder')){
        ordersPackages.forEach(order => {
          if(order.get('package.id') === itemId){
            orderPackageId = order.id;
          }
        });
        var loadingView = getOwner(this).lookup('component:loading').append();
        new AjaxPromise(`/orders_packages/${orderPackageId}`, "DELETE", this.get('session.authToken'))
        .then(() => {
          this.get('cart').removeItem(item);
          var ordersPackage = this.get('store').peekRecord('orders_package', orderPackageId);
          this.get('store').unloadRecord(ordersPackage);
          loadingView.destroy();
        });
      }else{
        this.get('cart').removeItem(item);
      }
    },

    checkout() {
      this.set('showCartDetailSidebar', false);
      var cartHasItems = this.get("cart.cartItems").length;
      if(cartHasItems > 0) {
        this.get('cart').set('checkout', true);
        this.transitionToRoute('order_details');
      } else {
        this.get('messageBox').alert(
          "The items in your cart are no longer available. Please add more items in your cart before placing an order. Thank you!",
          () => {
            this.get("cart").clearItems();
            this.set('displayCart', false);
          });
      }
    },

    openCart(){
      this.transitionToRoute('cart');
    }
  }

});
