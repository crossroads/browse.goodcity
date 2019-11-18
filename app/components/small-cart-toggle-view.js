import { inject as service } from "@ember/service";
import Component from "@ember/component";

export default Component.extend({
  cart: service(),

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
