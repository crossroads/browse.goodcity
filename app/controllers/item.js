import Ember from 'ember';
import config from "../config/environment";

export default Ember.Controller.extend({

  messageBox:     Ember.inject.service(),
  application:    Ember.inject.controller(),
  queryParams:    ['categoryId', 'sortBy'],
  categoryId:     null,
  cart:           Ember.inject.service(),
  sortBy:         "createdAt",
  item:           Ember.computed.alias('model'),
  noNextItem:     Ember.computed.empty('nextItem'),
  noPreviousItem: Ember.computed.empty('previousItem'),
  hideThumbnails: Ember.computed.gt('item.sortedImages.length', 1),
  smallScreenPreviewUrl: Ember.computed.alias('item.displayImage.smallScreenPreviewImageUrl'),
  itemNotAvailableShown: false,
  hasCartItems: Ember.computed.alias('application.hasCartItems'),
  isMobileApp: config.cordova.enabled,

  direction: null,

  hasQuantityAndIsAvailable: Ember.observer('item.isAvailable', 'item.packages.@each.orderId', 'item.isUnavailableAndDesignated', function() {
    var currentPath = this.get('target').currentPath;
    var item = this.get("item");
    var isItemUnavailable = this.get('item.isUnavailableAndDesignated');
    if((currentPath === 'item' || currentPath === "package_category") && isItemUnavailable && isItemUnavailable !== null && !this.get("itemNotAvailableShown")) {
      this.set("itemNotAvailableShown", true);
      if(this.get('cart').hasCartItem(item)) {
        this.get('cart').removeItem(item);
      }
      this.get('messageBox').alert(this.get('i18n').t('cart_content.unavailable'),
      () => {
        item.get('packages').forEach((pkg) => this.store.unloadRecord(pkg));
        this.set("itemNotAvailableShown", false);
        this.transitionToRoute('/browse');
      });
    }
  }),

  hasDraftOrder: Ember.computed.alias("session.draftOrder"),
  isOrderFulfilmentUser: Ember.computed(function() {
    let user = this.get('session.currentUser');
    return user.hasRole('Order fulfilment');
  }),

  presentInCart: Ember.computed('item', 'cart.counter', function(){
    return this.get('cart').hasCartItem(this.get('item'));
  }),

  allPackages: Ember.computed('item.packages.@each.isAvailable', function(){
    var item = this.get("item");
    return item.get("isItem") ? item.get('packages').filterBy("isAvailable") : [item];
  }),

  categoryObj: Ember.computed('categoryId' ,function(){
    return this.store.peekRecord('package_category', this.get("categoryId"));
  }),

  selectedSort: Ember.computed('sortBy' ,function() {
    return [this.get("sortBy")];
  }),

  sortedItems: Ember.computed.sort("categoryObj.items", "selectedSort"),

  nextItem: Ember.computed('model', 'sortedItems.[]' ,function(){
    var currentItem = this.get('item');
    var items = this.get("sortedItems").toArray();
    return items[items.indexOf(currentItem) + 1];
  }),

  previousItem: Ember.computed('model', 'sortedItems.[]' ,function(){
    var currentItem = this.get('item');
    var items = this.get("sortedItems").toArray();
    return items[items.indexOf(currentItem) - 1];
  }),

  previewUrl: Ember.computed("item.previewImageUrl", {
    get() {
      return this.get("item.previewImageUrl");
    },
    set(key, value) {
      return value;
    }
  }),

  actions: {
    showPreview(image) {
      this.set('previewUrl', image.get("previewImageUrl"));
    },

    goToStockItem(inventoryNumber) {
      let finalUrl;

      if(this.get('isMobileApp') && cordova.platformId === "android") { // jshint ignore:line
        finalUrl = "android-app://hk.goodcity.stockstaging/https/" + config.APP.STOCK_ANDROID_APP_HOST_URL + "/items/" + inventoryNumber;
        window.open(finalUrl, '_system');
      } else {
        finalUrl = config.APP.STOCK_APP_HOST_URL + "/items/" + inventoryNumber;
        window.open(finalUrl, '_blank');
      }
    },

    setDirectionAndRender(direction) {
      this.set('direction', direction);
      var targetItem = direction === "moveRight" ? this.get("previousItem") : this.get("nextItem");

      if(targetItem) {

        if(targetItem.get("isItem")) {
          this.transitionToRoute('item', targetItem,
            { queryParams: {
              sortBy: this.get("sortBy"),
              categoryId: this.get("categoryId") }
            }
          );
        } else {
          this.transitionToRoute('package', targetItem,
            { queryParams: {
              sortBy: this.get("sortBy"),
              categoryId: this.get("categoryId") }
            }
          );
        }

      }
    },

    requestItem(item) {
      this.get('cart').pushItem(item);
      Ember.run.later(this, function() {
        this.get('application').send('displayCart');
      }, 50);
    },

    removeItem(item) {
      this.get('cart').removeItem(item);
    }

  }
});
