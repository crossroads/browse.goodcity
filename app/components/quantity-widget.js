import { computed } from "@ember/object";
import Component from "@ember/component";

export default Component.extend({
  value: computed("model.package", function() {
    return this.get("package.requestedPackage")
      ? this.get("package.requestedPackage.quantity")
      : 1;
  }),

  performAction(value) {
    if (this.get("type") == "request") {
      this.requestAction(value);
    } else {
      this.updateAction(value, this.get("package.id"));
    }
  },

  actions: {
    incrementQty(quantity) {
      let incrementedValue = +this.get("value") + 1;
      incrementedValue <= +quantity
        ? this.set("value", incrementedValue) &&
          this.performAction(incrementedValue)
        : this.set("showErrorMessage", true);
    },

    decrementQty() {
      let decrementedValue = +this.get("value") - 1;
      decrementedValue >= 1
        ? this.set("value", decrementedValue) &&
          this.performAction(decrementedValue)
        : this.set("showErrorMessage", true);
    },

    focusOut(pkg) {
      const quantity = +this.get("value");
      if (
        quantity < 1 ||
        quantity > pkg.get("availableQuantity") ||
        !quantity
      ) {
        this.set("showErrorMessage", true);
        this.set("value", 1);
        return false;
      }
      this.performAction(quantity);
    },

    updateErrorMessage() {
      return false;
    }
  }
});
