// import { hash } from "rsvp";
import { inject as service } from "@ember/service";
import cloudinaryImage from "browse/mixins/cloudinary_image";
import _ from "lodash";
import MyOrdersRoute from "./my_orders";

export default MyOrdersRoute.extend(cloudinaryImage, {
  sharingService: service(),
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
          let cloudinaryImage = "";
          item.images = _.filter(
            response.included,
            image => image.attributes.imageable_id == item.id
          );
          let favouriteImage =
            item.images.find(e => e.id == item.attributes.favourite_image_id) ||
            item.images[0];
          cloudinaryImage =
            favouriteImage && favouriteImage.attributes.cloudinary_id;
          this.set("cloudinaryId", cloudinaryImage);
          item.previewUrl = this.generateUrl(500, 500, true);
        });
        offerObj.items = items;
        results.push(offerObj);
        return results;
      },
      []
    );
    return normalizedResponse;
  },

  async model() {
    let offerResponse = await this.store.query("offer_response", {
      offer_response: { user_id: this.get("session.currentUser").id }
    });

    if (offerResponse.content.length > 0) {
      this.get("store").pushPayload(offerResponse);
      let offerIds = offerResponse.map(record => record.get("offerId"));

      return this.get("offerService")
        .getSelectedOffers(offerIds)
        .then(data => {
          return this.get("store").pushPayload("offer", data.data);
          // return this.normalizeResponse(data);
        });
    }
  }
});
