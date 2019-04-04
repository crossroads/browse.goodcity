import Ember from "ember";
import _ from "lodash";
import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  previousRouteName: null,

  beforeModel() {
    this._super(...arguments);
    var previousRoutes = this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();

    if (previousRoute) {
      this.set("previousRouteName", previousRoute.name);
    }
    this.set("cart.checkout", false);
  },

  model() {
    return Ember.RSVP.hash({
      organisation: this.store.peekAll("organisation").objectAt(0),
      user: this.store.peekAll("user").objectAt(0),
      orders: this.store.query("order", { shallow: true }),
      beneficiaries: this.store.findAll("beneficiary", { reload: false }) // Will only return beneficiaries created by current user
    }).then(res => {
      // Load dependant associations
      return this.store
        .query("order_transport", {
          order_ids: res.orders.map(o => o.id).join(",")
        })
        .then(_.constant(res));
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set("previousRouteName", this.get("previousRouteName"));
    controller.toggleProperty("triggerFlashMessage");
    this.controllerFor("application").set("hideHeaderBar", false);
    this.controllerFor("application").set(
      "pageTitle",
      this.get("i18n").t("my_dashboard.title")
    );
  },

  resetController: function(controller, isExiting) {
    this._super.apply(this, arguments);
    if (isExiting) {
      this.controllerFor("application").set(
        "pageTitle",
        this.get("i18n").t("browse.title")
      );
    }
  }
});
