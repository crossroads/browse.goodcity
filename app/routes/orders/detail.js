import AuthorizeRoute from "./../authorize";
import Ember from "ember";

export default AuthorizeRoute.extend({
  currentRouteName: null,

  beforeModel() {
    this.set("currentRouteName", this.routeName);
  },
  model(params) {
    return Ember.RSVP.hash({
      packageCategories: this.store.peekAll("package_category"),
      order:
        this.store.peekRecord("order", params.order_id) ||
        this.store.findRecord("order", params.order_id, { reload: true })
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    var currentRoute = this.get("currentRouteName");
    if (currentRoute && currentRoute === "orders.detail") {
      this.transitionTo("orders.booking", model.order.id);
      this.controllerFor("application").set("hideHeaderBar", true);
    }
  }
});
