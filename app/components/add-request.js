import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import Component from "@ember/component";
import { getOwner } from "@ember/application";
import AjaxPromise from "browse/utils/ajax-promise";

export default Component.extend({
  store: service(),
  request: null,
  num: null,
  order: null,
  requestType: Ember.computed.alias("request.packageType"),

  packageTypeName: computed("request.packageType.name", function() {
    return this.get("requestType") ? `${this.get("requestType.name")}` : "";
  }),

  actions: {
    deleteRequest(reqId) {
      var i18n = this.get("i18n");
      this.get("messageBox").custom(
        i18n.t("order.request.remove_req").string + this.get("model.code"),
        i18n.t("order.request.remove").string,
        () => this.send("removeRequest", reqId),
        i18n.t("not_now").string
      );
    },

    removeRequest(reqId, index) {
      this.get("onRemoveRequest")(reqId, index);
    },

    searchPackageType(reqId, orderId) {
      this.get("router").transitionTo("order.search_code", orderId, {
        queryParams: { reqId: reqId }
      });
    },

    //Fix: Too deeply nested component(3 levels) failing randomly(Known issue with Ember)
    //Remove when Ember is upgraded to >= 3.0
    updateErrorMessage() {
      return false;
    }
  }
});
