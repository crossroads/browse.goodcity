import { getWithDefault, computed } from "@ember/object";
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

  allPackageSetsOrdered(packageSet, id) {
    const packages = packageSet.get("packages").toArray();
    return _.every(packages, pkg => {
      return pkg.get("ordersPackage.orderId") == id;
    });
  },

  hasOrderedGoods: notEmpty("order.ordersPackages"),

  orderedGoods: computed(
    "model.packageCategories",
    "model.order.ordersPackages.@each.state",
    "model.order.ordersPackages.@each.quantity",
    function() {
      const ordersPackages = this.getWithDefault(
        "order.ordersPackages",
        []
      ).filter(
        req => req.get("state") !== "cancelled" && req.get("quantity") > 0
      );

      let res = [];
      let refs = {};

      ordersPackages.map(req => {
        if (!req.get("package.hasSiblingPackages")) {
          res.push(req);
          return;
        }
        const packageSet = req.get("package.packageSet");
        const packageSetId = packageSet.get("id");
        if (refs[packageSetId]) {
          return; // Already processed
        }
        if (this.allPackageSetsOrdered(packageSet, req.get("orderId"))) {
          refs[packageSetId] = packageSet;
          res.push(packageSet);
          return;
        }
        res.push(req);
      });
      return _.map(res, record => {
        return { record };
      });
    }
  )
});
