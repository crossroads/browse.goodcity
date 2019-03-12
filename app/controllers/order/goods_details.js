import Ember from "ember";
const { getOwner } = Ember;
import AjaxPromise from "browse/utils/ajax-promise";
import config from "../../config/environment";
import cancelOrder from "../../mixins/cancel_order";

export default Ember.Controller.extend(cancelOrder, {
  showCancelBookingPopUp: false,
  queryParams: ["typeId", "fromClientInformation"],
  isMobileApp: config.cordova.enabled,
  order: Ember.computed.alias("model"),
  typeId: null,
  fromClientInformation: false,
  qty: null,
  otherDetails: "",
  sortProperties: ["id"],
  sortedGcRequests: Ember.computed.sort(
    "model.goodcityRequests",
    "sortProperties"
  ),

  hasNoGcRequests: Ember.computed("model.goodcityRequests", function() {
    return !this.get("model.goodcityRequests").length;
  }),

  actions: {
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

      Ember.RSVP.all(promises)
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
