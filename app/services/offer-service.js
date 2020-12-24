import { inject as service } from "@ember/service";
import ApiService from "./api-base-service";
import _ from "lodash";

export default ApiService.extend({
  async getAllOffers() {
    const url = "/shared/offers";

    return await this.GET(url, { version: "2" });
  },

  async getDetailOffer(public_uid) {
    const url = `/shared/offers/${public_uid}`;

    const offer = await this.GET(url, { version: "2" });
    const offerObj = {
      ...offer.data.attributes
    };
    const items = _.filter(offer.included, pkg => pkg.type == "package");
    items.map(item => {
      item.images = _.filter(
        offer.included,
        image => image.attributes.imageable_id == item.id
      );
    });
    offerObj.items = items;
    return offerObj;
  },

  normalizeResponse(response) {
    const normalizedResponse = _.reduce(
      response.data,
      (results, offer) => {
        const offerObj = {
          ...offer.attributes
        };
        const items = _.filter(
          response.included,
          pkg => pkg.attributes.offer_id == offer.id
        );
        items.map(item => {
          item.images = _.filter(
            response.included,
            image => image.attributes.imageable_id == item.id
          );
        });
        offerObj.items = items;
        results.push(offerObj);
        return results;
      },
      []
    );
    return normalizedResponse;
  }
});
