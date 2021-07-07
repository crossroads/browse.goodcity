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
  messages: service(),
  isLoggedIn: alias("session.isLoggedIn"),

  preloadData: function() {
    return all([this.loadStaticData(), this.loadUserData()]).then(res => {
      this.trigger("data");
      return res;
    });
  },

  loadStaticData() {
    return this.fetchAll(PRELOAD_TYPES);
  },

  loadOrderData() {
    return this.fetchAll(PRELOAD_OF_TYPE_ORDER);
  },

  loadMessages() {
    return this.get("messages").fetchUnreadMessages();
  },

  loadUserData() {
    if (!this.get("isLoggedIn")) {
      return resolve();
    }

    return all([
      this.get("session").loadUserProfile(),
      this.fetchAll(PRELOAD_AUTHORIZED_TYPES),
      this.loadOrderData(),
      this.loadMessages()
    ]);
  },

  fetchAll(types) {
    return all(_.map(types, t => this.fetch(t)));
  },

  fetch(type) {
    if (_.isString(type)) {
      type = [type, {}];
    }
    const [model, params] = type;
    return this.get("store").query(model, params);
  }
});
