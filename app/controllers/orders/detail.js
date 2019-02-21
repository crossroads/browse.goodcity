import Ember from "ember";

export default Ember.Controller.extend({
  isBooking: false,
  order: Ember.computed.alias('model.order')
});