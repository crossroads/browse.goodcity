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

  submitted: false,

  submittedOrderFlashMessage: Ember.observer("submitted", 'triggerFlashMessage', function() {
    if(this.get("submitted") && (this.get("previousRouteName") === "order.confirm")) {
      this.get("flashMessage").show("order.flash_submit_message");
    }
  }),

  actions: {
    setOrder(order) {
      this.set('selectedOrder', order);
    }
  }
});
