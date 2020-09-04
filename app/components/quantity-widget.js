import { computed } from "@ember/object";
import Component from "@ember/component";

export default Component.extend({
  value: computed("package", function() {
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

  validValueCheck(pkg) {
    let quantity = +this.get("value");
    return quantity < 1 || quantity > pkg.get("availableQuantity") || !quantity;
  },

  setUpdatedValue(value, isValueValid) {
    if (isValueValid) {
      this.set("showErrorMessage", false);
      this.set("value", value);
      this.performAction(value);
    } else {
      this.set("showErrorMessage", true);
    }
  },

  actions: {
    incrementQty(quantity) {
      let incrementedValue = +this.get("value") + 1;
      this.setUpdatedValue(incrementedValue, incrementedValue <= +quantity);
    },

    decrementQty() {
      let decrementedValue = +this.get("value") - 1;
      this.setUpdatedValue(decrementedValue, decrementedValue >= 1);
    },

    focusOut(pkg) {
      if (this.validValueCheck(pkg)) {
        this.set("showErrorMessage", true);
        this.set("value", 1);
      } else {
        this.set("showErrorMessage", false);
      }
      this.performAction(+this.get("value"));
    },

    // Fix: Failing randomly(Known issue with Ember)
    //Remove when Ember is upgraded to >= 3.0
    updateErrorMessage() {
      return false;
    }
  }
});
