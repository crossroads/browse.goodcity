import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import Component from "@ember/component";
import AsyncMixin from "browse/mixins/async_tasks";

export default Component.extend(AsyncMixin, {
  store: service(),
  request: null,
  num: null,
  order: null,
  requestType: Ember.computed.alias("request.packageType"),
  packageTypeService: service(),
  orderService: service(),
  packageTypeName: computed("request.packageType", function() {
    return this.get("requestType") ? `${this.get("requestType.name")}` : "";
  }),

  actions: {
    async removeRequest(id, index) {
      const req = this.get("store").peekRecord("goodcity_request", id);
      await this.runTask(this.get("orderService").deleteGoodsDetails(id));

      this.get("store").unloadRecord(req);
      this.get("onRemoveRequest")(id, index);
    },

    async packageTypeLookup() {
      const packageType = await this.get(
        "packageTypeService"
      ).packageTypeLookup();

      this.set("request.packageType", packageType);
    },

    //Fix: Too deeply nested component(3 levels) failing randomly(Known issue with Ember)
    //Remove when Ember is upgraded to >= 3.0
    updateErrorMessage() {
      return false;
    }
  }
});
