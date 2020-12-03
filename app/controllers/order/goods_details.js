import { all } from "rsvp";
import { computed } from "@ember/object";
import { alias, sort } from "@ember/object/computed";
import Controller from "@ember/controller";
import { getOwner } from "@ember/application";
import AjaxPromise from "browse/utils/ajax-promise";
import config from "../../config/environment";
import cancelOrder from "../../mixins/cancel_order";
import AsyncMixin from "../../mixins/async_tasks";

export default Controller.extend(cancelOrder, AsyncMixin, {
  showCancelBookingPopUp: false,
  queryParams: ["typeId", "fromClientInformation"],
  isMobileApp: config.cordova.enabled,
  order: alias("model"),
  typeId: null,
  fromClientInformation: false,
  qty: null,
  otherDetails: "",
  sortProperties: ["id"],

  hasNoGcRequests: computed(
    "order.goodcityRequests.[]",
    "order.goodcityRequests.@each.packageType",
    function() {
      return (
        this.get("order.goodcityRequests").filter(gr => gr.get("packageType"))
          .length !== this.get("order.goodcityRequests").length
      );
    }
  ),

  actions: {
    addRequest() {
      const goodcityRequest = {
        description: "",
        quantity: null,
        packageType: null
      };
      this.set("goodcityRequests", [
        ...this.get("goodcityRequests"),
        goodcityRequest
      ]);
    },

    async removeRequest(id, index) {
      try {
        if (id) {
          var url = `/goodcity_requests/${id}`;
          var req = this.get("store").peekRecord("goodcity_request", id);
          var loadingView = getOwner(this)
            .lookup("component:loading")
            .append();
          const data = await new AjaxPromise(
            url,
            "DELETE",
            this.get("session.authToken")
          );
          this.get("store").pushPayload(data);
          this.get("store").unloadRecord(req);
        }
        this.set("goodcityRequests", [
          ...this.get("goodcityRequests").slice(0, index),
          ...this.get("goodcityRequests").slice(index + 1)
        ]);
      } catch (error) {
        console.log(error);
      } finally {
        loadingView && loadingView.destroy();
      }
    },

    async saveGoodsDetails() {
      if (this.get("hasNoGcRequests")) {
        return false;
      }

      const goodcityRequests = this.get("goodcityRequests");

      await this.runTask(
        Promise.all(
          goodcityRequests.map(async gr => {
            if (gr.id) {
              await this.get("orderService").createGoodsDetails(
                this.get("order.id"),
                gr
              );
            } else {
              // await this.get('orderService').updateGoodsDetails(gr)
            }
          })
        )
      );

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
