import Ember from "ember";

export default Ember.Service.extend({
  resize() {
    Ember.$(".item-collection").height(
      Ember.$(".cart-items").height() - Ember.$(".cart-controls").height()
    );
  }
});
