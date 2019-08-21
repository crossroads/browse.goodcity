import Ember from "ember";

export default Ember.Component.extend({
  cart: Ember.inject.service(),

  // Set to true to enable navigation to the details
  // Usage: {{small-cart-toggle-view allowClick=true}}
  allowClick: false,
  showCartSummary: false,

  actions: {
    toggleCartSummary() {
      this.toggleProperty("showCartSummary");
    },
    showItemDetails(item) {
      if (!this.get("allowClick")) {
        return;
      }
      this.get("cart").navigateToItemDetails(item);
    }
  }
});
