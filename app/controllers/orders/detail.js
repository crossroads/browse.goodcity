import Ember from "ember";
import applicationController from './../application';

export default applicationController.extend({
  isBooking: false,
  order: Ember.computed.alias('model.order'),
  hideHeaderBar: Ember.computed.alias("applicationController.hideHeaderBar"),
});