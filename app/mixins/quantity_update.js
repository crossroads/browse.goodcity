import { inject as service } from "@ember/service";
import Mixin from "@ember/object/mixin";

export default Mixin.create({
  cart: service(),
  updatedQuantity: {},

  updateRequestedQuantityValue(record) {
    return Object.keys(record).map(pkgId => {
      this.get("cart").updateRequestedQuantity(pkgId, record[pkgId]);
    });
  },

  actions: {
    UpdateRequestedValue(value, id) {
      var quantityHash = { [id]: value };
      Object.assign(this.get("updatedQuantity"), quantityHash);
    }
  }
});
