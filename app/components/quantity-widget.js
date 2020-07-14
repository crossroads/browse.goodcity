import { computed } from "@ember/object";
import Component from "@ember/component";

export default Component.extend({
  value: computed("model.package", function() {
    return this.get("package.requestedPackage")
      ? this.get("package.requestedQuantity")
      : 1;
  }),

  setValue(value, isValidValue) {
    if (isValidValue) {
      this.set("showErrorMessage", false);
      this.set("value", value);
    } else {
      this.set("showErrorMessage", true);
    }
  },

  actions: {
    incrementQty(quantity) {
      let incrementedValue = +this.get("value") + 1;
      this.setValue(incrementedValue, incrementedValue <= +quantity);
    },

    decrementQty() {
      let decrementedValue = +this.get("value") - 1;
      this.setValue(decrementedValue, decrementedValue >= 1);
    },

    focusOut(pkg) {
      const quantity = +this.get("value");
      if (
        +quantity < 1 ||
        +quantity > +pkg.get("availableQuantity") ||
        !+quantity
      ) {
        this.set("showErrorMessage", true);
        this.set("value", 1);
        return false;
      }
    },

    updateErrorMessage() {
      return false;
    }
  }
});
