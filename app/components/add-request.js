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

  packageTypeName: computed("request.packageType.name", function() {
    return this.get("request.packageType.name");
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

    removeRequest(reqId) {
      var url = `/goodcity_requests/${reqId}`;
      var req = this.get("store").peekRecord("goodcity_request", reqId);
      var loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
      new AjaxPromise(url, "DELETE", this.get("session.authToken"))
        .then(data => {
          this.get("store").pushPayload(data);
        })
        .finally(() => {
          loadingView.destroy();
          this.get("store").unloadRecord(req);
        });
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
