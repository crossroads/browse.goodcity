import Ember from 'ember';
import itemController from './item';

export default itemController.extend({
  messageBox:           Ember.inject.service(),
  package:              Ember.computed.alias('model'),
  queryParams:          ['categoryId', 'sortBy'],
  categoryId:           null,
  sortBy:               "createdAt",
  pkgNotAvailableShown: false,
  cart:                 Ember.inject.service(),

  hasQuantityAndIsAvailable: Ember.observer('package.isAvailable', 'package.orderId', 'package.isUnavailableAndDesignated', function() {
    var currentPath;
    var pkg = this.get('package');
    var ispkgUnavailable;
    if(this.get('target')) {
      currentPath = this.get('target').currentPath;
    }
    if(pkg) {
      ispkgUnavailable = pkg.get('isUnavailableAndDesignated');
    }
    if((currentPath === 'package' || currentPath === "package_category" ) && ispkgUnavailable && ispkgUnavailable !== null && !this.get('pkgNotAvailableShown')) {
      this.set('pkgNotAvailableShown', true);
      if(this.get('cart').hasCartItem(pkg)) {
        this.get('cart').removeItem(pkg);
      }
      this.get('messageBox').alert(this.get('i18n').t('cart_content.unavailable'),
      () => {
        this.store.unloadRecord(pkg);
        this.set('pkgNotAvailableShown', false);
        this.transitionToRoute('/browse');
      });
    }
  })
});
