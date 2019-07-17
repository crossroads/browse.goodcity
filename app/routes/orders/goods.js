import detail from "./detail";

export default detail.extend({
  loadPackagesOf(order) {
    return this.get("store")
      .query("orders_package", {
        search_by_order_id: order.get("id")
      })
      .then(ops => {
        return Ember.RSVP.all(
          ops.map(op => {
            return this.loadIfAbsent("package", op.get("packageId"));
          })
        );
      });
  },

  model(params) {
    return this._super(...arguments).then(data => {
      const order_ids = params.order_id;
      const store = this.get("store");
      data.gcRequests = store.query("goodcity_request", { order_ids });
      data.packages = this.loadPackagesOf(data.order);
      return Ember.RSVP.hash(data);
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    const isRecentlyUpdated = model.packages.some(
      this.recentUpdatedPackageCheck
    );
    controller.set("showUpdateMessage", isRecentlyUpdated);
  },

  recentUpdatedPackageCheck(pkg) {
    return moment().diff(pkg.get("updatedAt"), "minutes") <= 5;
  }
});
