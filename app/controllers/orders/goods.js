import Ember from "ember";
import detail from "./detail";
import _ from "lodash";

export default detail.extend({
  order: Ember.computed.alias("model.order"),

  getCategoryForCode: function(code) {
    const categories = this.get("model.packageCategories");
    const category = categories.find(c =>
      _.includes(c.get("packageTypeCodes"), code)
    );
    return category && category.get("name");
  },

  showUpdateMessage: Ember.computed(
    "model.order.ordersPackages.[]",
    function() {
      const isRecentlyUpdated = this.get("model.order.ordersPackages")
        .toArray()
        .some(this.recentUpdatedPackageCheck);
      return isRecentlyUpdated;
    }
  ),

  recentUpdatedPackageCheck(pkg) {
    return moment().diff(pkg.get("createdAt"), "minutes") <= 5;
  },

  hasRequestedGoods: Ember.computed.notEmpty("requestedGoods"),

  requestedGoods: Ember.computed(
    "order.goodcityRequests.@each.packageType",
    function() {
      const requests = this.getWithDefault("order.goodcityRequests", []);
      return requests.map(req => ({
        category: this.getCategoryForCode(req.get("packageType.code")),
        text: req.get("packageType.name")
      }));
    }
  ),

  hasOrderedGoods: Ember.computed.notEmpty("orderedGoods"),

  orderedGoods: Ember.computed("model.packageCategories", function() {
    const orderPackages = this.getWithDefault("order.ordersPackages", []);
    return orderPackages.map(op => ({
      notes: op.get("package.notes"),
      text: op.get("package.packageType.name"),
      imageUrl: op.get("package.previewImageUrl")
    }));
  })
});
