import { computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import Controller from "@ember/controller";
import { inject as service } from "@ember/service";
import config from "../../config/environment";
import cancelOrder from "../../mixins/cancel_order";
import AsyncMixin from "../../mixins/async_tasks";

export default Controller.extend(cancelOrder, AsyncMixin, {
  packageTypeService: service(),
  messageBox: service(),
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
    "goodcityRequests.[]",
    "goodcityRequests.@each.packageType",
    function() {
      return (
        this.get("goodcityRequests").length === 0 ||
        this.get("goodcityRequests").filter(gr => gr.packageType).length !==
          this.get("goodcityRequests").length
      );
    }
  ),

  async createGoodsDetails(orderId, params, index) {
    const data = await this.get("orderService").createGoodsDetails(
      orderId,
      params
    );
    const goodcityRequests = this.get("goodcityRequests");
    goodcityRequests[index].id = data["goodcity_request"]["id"];
    this.set("goodcityRequests", [...goodcityRequests]);
  },

  async updateGoodsDetails(orderId, params) {
    await this.get("orderService").updateGoodsDetails(orderId, params);
  },

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

    async onRemoveRequest(_id, index) {
      this.set("goodcityRequests", [
        ...this.get("goodcityRequests").slice(0, index),
        ...this.get("goodcityRequests").slice(index + 1)
      ]);
    },

    async saveGoodsDetails() {
      if (this.get("hasNoGcRequests")) {
        return false;
      }
      const orderId = this.get("order.id");
      const goodcityRequests = this.get("goodcityRequests");
      try {
        await this.runTask(
          Promise.all(
            goodcityRequests.map(async (gr, index) => {
              const params = {
                packageTypeId: gr.packageType.get("id"),
                quantity: gr.quantity
              };
              if (!gr.id) {
                return this.createGoodsDetails(orderId, params, index);
              } else {
                params.id = gr.id;
                return this.updateGoodsDetails(orderId, params);
              }
            })
          )
        );
        this.transitionToRoute("order.schedule_details", orderId);
      } catch (e) {
        this.get("messageBox").alert(e.responseJSON.errors[0].message);
      }
    }
  }
});
