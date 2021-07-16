import Ember from "ember";
import ApiBaseService from "./api-base-service";
import config from "../config/environment";
import { SHAREABLE_TYPES } from "../models/shareable";

export default ApiBaseService.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service(),
  offerService: Ember.inject.service(),

  init() {
    this.useBaseUrl(config.APP.SERVER_PATH_V2);
  },

  /**
   * Loads shareable records
   *
   * @param {string} type
   * @param {string|string[]} ids
   * @returns {Promise<Shareable[]>}
   */
  loadShareable(type, ids) {
    ids = Array.isArray(ids) ? ids : [ids];

    return this.get("store").query("shareable", {
      resource_type: type,
      resource_id: ids.join(",")
    });
  },

  async loadShareableOffers(offerIds) {
    return await Ember.RSVP.all([
      this.loadShareable(SHAREABLE_TYPES.OFFER, offerIds)
    ]);
  }
});
