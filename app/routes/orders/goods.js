import detail from "./detail";

export default detail.extend({
  showMessage: false,

  beforeModel(transition) {
    const previousRoutes = this.router.router.currentHandlerInfos;
    const previousRoute = previousRoutes && previousRoutes.pop().name;
    if (previousRoute === "submitted_orders") {
      this.set("showMessage", true);
    }
  },

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
    if (this.get("showMessage")) {
      controller.set("showUpdateMessage", true);
    }
  }
});
