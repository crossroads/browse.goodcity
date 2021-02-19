import PublicRoute from "../browse_pages";
import cloudinaryImage from "../../mixins/cloudinary_image";
import { inject as service } from "@ember/service";
import _ from "lodash";

export default PublicRoute.extend(cloudinaryImage, {
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

  model() {
    return this.get("offerService")
      .getAllOffers()
      .then(data => {
        return this.normalizeResponse(data);
      });
  }
});
