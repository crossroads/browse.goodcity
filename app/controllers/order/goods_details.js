import { all } from "rsvp";
import { computed } from "@ember/object";
import { alias, sort } from "@ember/object/computed";
import Controller from "@ember/controller";
import { getOwner } from "@ember/application";
import AjaxPromise from "browse/utils/ajax-promise";
import config from "../../config/environment";
import cancelOrder from "../../mixins/cancel_order";

export default Controller.extend(cancelOrder, {
  showCancelBookingPopUp: false,
  queryParams: ["typeId", "fromClientInformation"],
  isMobileApp: config.cordova.enabled,
  order: alias("model"),
  typeId: null,
  fromClientInformation: false,
  qty: null,
  otherDetails: "",
  sortProperties: ["id"],
  sortedGcRequests: sort("order.goodcityRequests", "sortProperties"),

  hasNoGcRequests: computed("order.goodcityRequests.[]", function() {
    return !this.get("order.goodcityRequests").length;
  }),

  actions: {
    back() {
      let orderId = this.get("order.id") || this.get("orderId");
      if (
        this.get("fromClientInformation") ||
        this.get("backLinkPath") == "order.client_information"
      ) {
        this.transitionToRoute("order.client_information", orderId);
      } else {
        this.transitionToRoute(this.get("backLinkPath"), orderId);
      }
    },
    addRequest() {
      var orderId = this.get("order.id");
      var goodcityRequestParams = {};
      goodcityRequestParams["quantity"] = 1;
      goodcityRequestParams["order_id"] = orderId;
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();

      new AjaxPromise(
        "/goodcity_requests",
        "POST",
        this.get("session.authToken"),
        { goodcity_request: goodcityRequestParams }
      )
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
        });
    },

    saveGoodsDetails() {
      if (this.get("hasNoGcRequests")) {
        return false;
      }
      var promises = [];
      this.get("order.goodcityRequests").forEach(goodcityRequest => {
        promises.push(goodcityRequest.save());
      });

      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();

      all(promises)
        .then(function() {
          loadingView.destroy();
        })
        .finally(() => {
          this.transitionToRoute(
            "order.schedule_details",
            this.get("order.id")
          );
        });
    }
  }
});
