import { all, resolve } from "rsvp";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import Evented from "@ember/object/evented";
import _ from "lodash";
import config from "../config/environment";
import ApiService from "./api-base-service";

const { PRELOAD_TYPES, PRELOAD_AUTHORIZED_TYPES } = config.APP;

/**
 * Preload service
 *
 */
export default ApiService.extend(Evented, {
  store: service(),
  session: service(),

  isLoggedIn: alias("session.isLoggedIn"),

  preloadData: function() {
    return all([this.loadStaticData(), this.loadUserData()]).then(res => {
      this.trigger("data");
      return res;
    });
  },

  loadStaticData() {
    return this.fetch(PRELOAD_TYPES);
  },

  loadUserData() {
    if (!this.get("isLoggedIn")) {
      return resolve();
    }

    return all([
      this.get("session").loadUserProfile(),
      this.fetch(PRELOAD_AUTHORIZED_TYPES)
    ]);
  },

  fetch(type) {
    if (_.isArray(type)) {
      return all(type.map(this.fetch.bind(this)));
    }
    return this.get("store").findAll(type, { backgroundReload: false });
  }
});
