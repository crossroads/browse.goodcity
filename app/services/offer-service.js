import { inject as service } from "@ember/service";
import ApiService from "./api-base-service";
import _ from "lodash";
import cloudinaryImage from "../mixins/cloudinary_image";

export default ApiService.extend(cloudinaryImage, {
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
      let cloudinaryImage = "";
      item.images = _.filter(
        offer.included,
        image => image.attributes.imageable_id == item.id
      );
      let favouriteImage =
        item.images.find(e => e.id == item.attributes.favourite_image_id) ||
        item.images[0];
      cloudinaryImage =
        favouriteImage && favouriteImage.attributes.cloudinary_id;
      this.set("cloudinaryId", cloudinaryImage);
      item.previewUrl = this.generateUrl(500, 500, true);
      item.description = this.getDescription(item);
    });
    offerObj.items = items;
    return offerObj;
  },

  getDescription(item) {
    let lang = this.get("i18n.locale");
    let chineseDescription = (item.attributes.notes_zh_tw || "").trim();

    if (lang === "zh-tw" && !!chineseDescription) {
      return chineseDescription;
    }
    return item.attributes.notes;
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
