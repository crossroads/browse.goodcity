import { computed } from "@ember/object";
import AuthorizeRoute from "./../authorize";
import AjaxPromise from "browse/utils/ajax-promise";

export default AuthorizeRoute.extend({
  backLinkPath: computed.localStorage(),
  orderId: null,

  queryParams: {
    fromClientInformation: false
  },

  beforeModel() {
    var previousRoutes =
      this.router.router && this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();
    if (previousRoute) {
      var parentRoute = previousRoutes[1];
      var hasParentRoute =
        parentRoute && parentRoute.name === "order.client_information";
      var isSearchRoute = previousRoute.name === "code_search";
      if (!isSearchRoute && hasParentRoute) {
        this.set("backLinkPath", previousRoute.name);
      } else {
        this.set("backLinkPath", null);
      }
    }
  },

  model() {
    var orderId = this.paramsFor("order").order_id;
    var goodcityRequestParams = {};
    goodcityRequestParams["quantity"] = 1;
    goodcityRequestParams["order_id"] = orderId;

    // chaining here is not working as expected thats why we need return for both promises here.
    return new AjaxPromise(
      `/orders/${orderId}/`,
      "GET",
      this.get("session.authToken")
    ).then(data => {
      this.set("orderId", orderId);
      this.get("store").pushPayload(data);
      if (!data["goodcity_requests"].length) {
        return new AjaxPromise(
          "/goodcity_requests",
          "POST",
          this.get("session.authToken"),
          { goodcity_request: goodcityRequestParams }
        ).then(data => {
          this.get("store").pushPayload(data);
        });
      }
    });
  },

  setupController(controller, model) {
    model = this.store.peekRecord("order", this.get("orderId"));
    controller.set("model", model);
    if (this.get("backLinkPath") !== null) {
      controller.set("backLinkPath", this.get("backLinkPath"));
    } else {
      controller.set("backLinkPath", "order.client_information");
    }
    this.controllerFor("application").set("showSidebar", false);
  },

  deactivate() {
    this.controllerFor("application").set("showSidebar", true);
  }
});
