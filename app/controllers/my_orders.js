import applicationController from './application';
import Ember from 'ember';
import _ from 'lodash';
import AjaxPromise from 'browse/utils/ajax-promise';

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
  showCancelBookingPopUp: false,
  cancellationReasonWarning: false,
  applicationController: Ember.inject.controller('application'),
  hideHeaderBar: Ember.computed.alias("applicationController.hideHeaderBar"),

  getCategoryForCode: function (code) {
    const categories = this.get('model.packageCategories');
    const category = categories.find(c => _.includes(c.get('packageTypeCodes'), code));
    return category && category.get('name');
  },

  selectedOrderId: Ember.computed("selectedOrder", function() {
    return this.get("selectedOrder.id");
  }),

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

  submittedOrderFlashMessage: Ember.observer("submitted", 'triggerFlashMessage', function() {
    if(this.get("submitted") && (this.get("previousRouteName") === "order.confirm")) {
      this.get("flashMessage").show("order.flash_submit_message");
    }
  }),

  actions: {
    redirectToEdit(routeName) {
      let orderId = this.get("selectedOrder.id");
      this.transitionToRoute(`order.${routeName}`, orderId);
    },

    editRequestPurpose() {
      let orderId = this.get("selectedOrder.id");
      this.transitionToRoute(`request_purpose`,
        {
          queryParams: {
            orderId: orderId,
            bookAppointment: false,
            editRequest: true
          }
        });
    },

    cancelBookingPopUp() {
      this.set("showCancelBookingPopUp", true);
    },

    removePopUp() {
      this.set("showCancelBookingPopUp", false);
    },

    cancelOrder() {
      let order = this.get("selectedOrder");
      if(order) {
        if(order.get("isDraft")) {
          this.deleteOrder(order);
        } else if(order.get("isCancelAllowed")) {
          this.cancelOrder(order);
        }
      }
    }
  }
});
