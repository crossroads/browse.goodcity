import { computed } from "@ember/object";
import Component from "@ember/component";

export default Component.extend({
  value: computed("model.package", function() {
    if (this.get("package.requestedPackage")) {
      return this.get("package.requestedPackage.quantity");
    }
    return 1;
  }),
  setValueIfValid(value, isValidValue, id) {
    if (isValidValue) {
      this.set("showErrorMessage", false);
      Ember.$("#qty" + id).val(value);
    } else {
      this.set("showErrorMessage", true);
    }
  },
  elementValue(id) {
    console.log(Ember.$("#qty" + id).val());
    return Ember.$("#qty" + id).val();
  },
  actions: {
    incrementQty(quantity, id) {
      let incrementedValue = +this.elementValue(id) + 1;
      this.setValueIfValid(incrementedValue, incrementedValue <= +quantity, id);
    },

    decrementQty(id) {
      let decrementedValue = +this.elementValue(id) - 1;
      this.setValueIfValid(decrementedValue, decrementedValue >= 1, id);
    },

    focusOut(pkg) {
      const quantity = this.elementValue(pkg.id);
      console.log(pkg.availableQuantity);
      console.log(pkg.get("availableQuantity"));
      console.log(!+quantity);
      if (
        +quantity < 1 ||
        +quantity > +pkg.get("availableQuantity") ||
        !+quantity
      ) {
        this.set("showErrorMessage", true);
        Ember.$("#qty" + pkg.id).val(1);
        return false;
      }
    },

    updateErrorMessage() {
      return false;
    }
  }
});
