import PublicRoute from "../browse_pages";
import { inject as service } from "@ember/service";
import _ from "lodash";

export default PublicRoute.extend({
  offerService: service(),

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
  },

  model() {
    return this.get("offerService")
      .getAllOffers()
      .then(data => {
        return this.normalizeResponse(data);
      });
  }
});
