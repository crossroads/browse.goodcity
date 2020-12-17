import { inject as service } from "@ember/service";
import ApiService from "./api-base-service";
import _ from "lodash";

export default ApiService.extend({
  getAllOffers() {
    const url = "shared/offers";

    return this.GET(url, { version: "v2" }).then(() => {
      const localRecord = store.peekRecord("order", ID(order));
      if (localRecord) {
        store.unloadRecord(localRecord);
      }
    });
  }
});
