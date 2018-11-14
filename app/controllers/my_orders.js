import Ember from 'ember';
import _ from 'lodash';

export default Ember.Controller.extend({
  sortProperties: ["createdAt:desc"],
  arrangedOrders: Ember.computed.sort("model.orders", "sortProperties"),
  selectedOrder: null,
  orders: Ember.computed.alias('model'),
  flashMessage: Ember.inject.service(),
  queryParams: ['submitted'],
  triggerFlashMessage: false,
  previousRouteName: null,

  getCategoryForCode: function (code) {
    const categories = this.get('model.packageCategories');
    const category = categories.find(c => _.includes(c.get('packageTypeCodes'), code));
    return category && category.get('name');
  },

  requestedGoods: Ember.computed('selectedOrder', 'model.packageCategories', function () {
    const requests = this.get('selectedOrder.goodcityRequests');
    if (!requests) {
      return [];
    }
    return requests.map(req => ({ 
      category: this.getCategoryForCode(req.get('packageType.code')),
      text: req.get('packageType.name')
    }));
  }),

  hasRequestedGoods: Ember.computed.notEmpty('requestedGoods'),

  orderedGoods: Ember.computed('selectedOrder', 'model.packageCategories', function () {
    const orderPackages = this.get('selectedOrder.ordersPackages');
    if (!orderPackages) {
      return [];
    }
    return orderPackages.map(op => ({ 
      notes: op.get('package.notes'), 
      text: op.get('package.packageType.name'),
      imageUrl: op.get('package.favouriteImage.imageUrl')
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

  actions: {
    setOrder(order) {
      this.set('selectedOrder', order);
      this.set('selectedOrderTab', this.orderSummaryTabs[0]);
    },
    selectTab(tab) {
      this.set('selectedOrderTab', tab);
    }
  }
});
