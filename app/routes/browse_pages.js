import Ember from "ember";

export default Ember.Route.extend({
  beforeModel() {
    this.set("cart.checkout", false);
  }
});
