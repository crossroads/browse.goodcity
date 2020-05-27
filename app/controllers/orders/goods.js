import { computed } from "@ember/object";
import { alias, notEmpty } from "@ember/object/computed";
import detail from "./detail";
import _ from "lodash";

export default detail.extend({
  order: alias("model.order"),

  getCategoryForCode: function(code) {
    const categories = this.get("model.packageCategories");
    const category = categories.find(c =>
      _.includes(c.get("packageTypeCodes"), code)
    );
    return category && category.get("name");
  },

  showUpdateMessage: computed("model.order.ordersPackages.[]", function() {
    const isRecentlyUpdated = this.get("model.order.ordersPackages")
      .toArray()
      .some(this.recentUpdatedPackageCheck);
    return isRecentlyUpdated;
  }),

  recentUpdatedPackageCheck(pkg) {
    return moment().diff(pkg.get("createdAt"), "minutes") <= 5;
  },

  hasRequestedGoods: notEmpty("requestedGoods"),

  requestedGoods: computed(
    "order.goodcityRequests.@each.packageType",
    function() {
      const requests = this.getWithDefault("order.goodcityRequests", []);
      return requests.map(req => ({
        category: this.getCategoryForCode(req.get("packageType.code")),
        text: req.get("packageType.name")
      }));
    }
  ),

  hasOrderedGoods: notEmpty("orderedGoods"),

  orderedGoods: computed("model.packageCategories", function() {
    return this.getWithDefault("order.ordersPackages", []);
  })
});
