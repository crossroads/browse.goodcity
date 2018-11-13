import Ember from 'ember';

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
    const category = categories.find(cat => {
      return cat.get('packageTypeCodes').indexOf(code) >= 0;
    });
    return category && category.get('name');
  },

  requestedGoods: Ember.computed('selectedOrder', 'model.packageCategories', function () {
    const order = this.get('selectedOrder');
    if (!order) {
      return [];
    }
    return order.get('goodcityRequests').map(req => {
      const text = req.get('packageType.name');
      const category = this.getCategoryForCode(req.get('packageType.code'));
      return { category, text };
    });
  }),

  hasRequestedGoods: Ember.computed.notEmpty('requestedGoods'),

  orderedGoods: Ember.computed('selectedOrder', 'model.packageCategories', function () {
    const order = this.get('selectedOrder');
    if (!order) {
      return [];
    }
    return order.get('ordersPackages').map((orderPackage) => {
      const text = orderPackage.get('package.packageType.name');
      const category = this.getCategoryForCode(orderPackage.get('package.packageType.code'));
      return { category, text };
    });
  }),

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
