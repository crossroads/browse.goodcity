import applicationController from './application';
import Ember from 'ember';

export default applicationController.extend({
  sortProperties: ["createdAt:desc"],
  arrangedOrders: Ember.computed.sort("model.orders", "sortProperties"),
  orders: Ember.computed.alias('model'),
  flashMessage: Ember.inject.service(),
  messageBox: Ember.inject.service(),
  queryParams: ['submitted'],
  triggerFlashMessage: false,
  previousRouteName: null,
  showCancelBookingPopUp: false,
  cancellationReasonWarning: false,
  applicationController: Ember.inject.controller('application'),

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

  submitted: false,

  submittedOrderFlashMessage: Ember.observer("submitted", 'triggerFlashMessage', function() {
    if(this.get("submitted") && (this.get("previousRouteName") === "order.confirm")) {
      this.get("flashMessage").show("order.flash_submit_message");
    }
  }),
});
