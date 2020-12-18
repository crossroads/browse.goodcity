import { inject as service } from "@ember/service";
import ApiService from "./api-base-service";
import _ from "lodash";

export default ApiService.extend({
  async getAllOffers() {
    const url = "/shared/offers";

    return await this.GET(url, { version: "2" });
  }
});
