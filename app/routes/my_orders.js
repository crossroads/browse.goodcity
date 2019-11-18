import { hash } from "rsvp";
import { inject as service } from "@ember/service";
import _ from "lodash";
import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  orderService: service(),
  previousRouteName: null,

  beforeModel() {
    this._super(...arguments);
    var previousRoutes =
      this.router.router && this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();

    if (previousRoute) {
      this.set("previousRouteName", previousRoute.name);
    }
    this.set("cart.checkout", false);
  },

  model() {
    return hash({
      organisation: this.store.peekAll("organisation").objectAt(0),
      user: this.store.peekAll("user").objectAt(0),
      orders: this.get("orderService").loadAll({ shallow: true })
    }).then(res => {
      return this.get("orderService")
        .loadOrderTransports()
        .then(() => res);
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
