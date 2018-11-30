import applicationController from './application';
import Ember from 'ember';
import _ from 'lodash';

export default applicationController.extend({
  sortProperties: ["createdAt:desc"],
  arrangedOrders: Ember.computed.sort("model.orders", "sortProperties"),
  selectedOrder: null,
  orders: Ember.computed.alias('model'),
  flashMessage: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  queryParams: ['submitted'],
  triggerFlashMessage: false,
  previousRouteName: null,

  buttonStyle: "light",

  getCategoryForCode: function (code) {
    const categories = this.get('model.packageCategories');
    const category = categories.find(c => _.includes(c.get('packageTypeCodes'), code));
    return category && category.get('name');
  },

  fetchPackageImages(pkg) {
    return Ember.RSVP.all(
      pkg.getWithDefault('imageIds', []).map(id => this.store.findRecord('image', id, { reload: false }))
    );
  },

  fetchMissingImages(order) {
    const ordersPackages = order.getWithDefault('ordersPackages', []);
    return Ember.RSVP.all(
      ordersPackages.map(op => this.fetchPackageImages(op.get('package')))
    );
  },

  requestedGoods: Ember.computed('selectedOrder', 'model.packageCategories', function () {
    const requests = this.getWithDefault('selectedOrder.goodcityRequests', []);
    return requests.map(req => ({
      category: this.getCategoryForCode(req.get('packageType.code')),
      text: req.get('packageType.name')
    }));
  }),

  hasRequestedGoods: Ember.computed.notEmpty('requestedGoods'),

  orderedGoods: Ember.computed('selectedOrder', 'model.packageCategories', function () {
    const orderPackages = this.getWithDefault('selectedOrder.ordersPackages', []);
    return orderPackages.map(op => ({
      notes: op.get('package.notes'),
      text: op.get('package.packageType.name'),
      imageUrl: op.get('package.previewImageUrl')
    }));
  }),

  hasOrderedGoods: Ember.computed.notEmpty('orderedGoods'),

  submitted: false,
  orderSummaryTabs: [
    {
      name: 'booking',
      icon: 'calendar'
    },
    {
      name: 'goods',
      icon: 'shopping-basket'
    }
  ],

  submittedOrderFlashMessage: Ember.observer("submitted", 'triggerFlashMessage', function() {
    if(this.get("submitted") && (this.get("previousRouteName") === "order.confirm")) {
      this.get("flashMessage").show("order.flash_submit_message");
    }
  }),

  showLoadingSpinner() {
    if (Ember.testing) {
      return;
    }
    if (!this.loadingView) {
      this.loadingView = Ember.getOwner(this).lookup('component:loading').append();
    }
  },

  hideLoadingSpinner() {
    if (Ember.testing) {
      return;
    }
    if (this.loadingView) {
      this.loadingView.destroy();
      this.loadingView = null;
    }
  },

  actions: {
    setOrder(order) {
      if (!order) {
        this.set('selectedOrder', null);
        return;
      }
      // Request the order to load dependant associations
      this.showLoadingSpinner();
      this.store.findRecord('order', order.get('id'), { reload: true, adapterOptions: { includePackages: 'false'} })
        .then(record => this.fetchMissingImages(record).then(_.constant(record)))
        .then(record => {
          this.set('selectedOrder', record);
          this.set('selectedOrderTab', this.orderSummaryTabs[0]);
        })
        .catch(() => {
          this.get("messageBox").alert();
        })
        .finally(() => this.hideLoadingSpinner());
    },
    selectTab(tab) {
      if (tab !== this.get('selectedOrderTab')) {
        this.set('selectedOrderTab', tab);
      }
    }
  }
});
