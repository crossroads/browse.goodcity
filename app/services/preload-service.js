import { all, resolve } from "rsvp";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import Evented from "@ember/object/evented";
import _ from "lodash";
import config from "../config/environment";
import ApiService from "./api-base-service";

const {
  PRELOAD_TYPES,
  PRELOAD_AUTHORIZED_TYPES,
  PRELOAD_OF_TYPE_ORDER
} = config.APP;

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

  loadOrderData() {
    return this.query(PRELOAD_OF_TYPE_ORDER);
  },

  loadUserData() {
    if (!this.get("isLoggedIn")) {
      return resolve();
    }

    return all([
      this.get("session").loadUserProfile(),
      this.fetch(PRELOAD_AUTHORIZED_TYPES),
      this.loadOrderData()
    ]);
  },

  fetch(type) {
    if (_.isArray(type)) {
      return all(type.map(this.fetch.bind(this)));
    }
    return this.get("store").findAll(type, { backgroundReload: false });
  },

  query(type) {
    if (_.isArray(type)) {
      return all(type.map(this.query.bind(this)));
    }
    return this.get("store").query(type, { for: "order" });
  }
});
