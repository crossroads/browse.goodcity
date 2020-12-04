import { computed } from "@ember/object";
import AuthorizeRoute from "./../authorize";
import AjaxPromise from "browse/utils/ajax-promise";

export default AuthorizeRoute.extend({
  backLinkPath: computed.localStorage(),
  orderId: null,
  queryParams: {
    fromClientInformation: false
  },

  model() {
    this._super(...arguments);
    var orderId = this.paramsFor("order").order_id;
    var goodcityRequestParams = {};
    goodcityRequestParams["quantity"] = 1;
    goodcityRequestParams["order_id"] = orderId;
    this.set("orderId", orderId);

    return this.loadIfAbsent("order", orderId);
  },

  setupController(controller, model) {
    controller.set("model", model);
    if (this.get("backLinkPath") !== null) {
      controller.set("backLinkPath", this.get("backLinkPath"));
    } else {
      controller.set("backLinkPath", "order.client_information");
    }
    this.controllerFor("application").set("showSidebar", false);
    this.setupGoods(controller, model);
  },

  setupGoods(controller, model) {
    const goodcityRequests = [];
    if (!model.get("goodcityRequests").length) {
      goodcityRequests.push({
        description: null,
        quantity: null,
        packageType: null
      });
    } else {
      model.get("goodcityRequests").map(gr => {
        goodcityRequests.push({
          id: gr.get("id"),
          description: gr.get("description"),
          quantity: gr.get("quantity"),
          packageType: gr.get("packageType")
        });
      });
    }
    controller.set("goodcityRequests", goodcityRequests);
  },

  deactivate() {
    this.controllerFor("application").set("showSidebar", true);
  }
});
