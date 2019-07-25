import _ from "lodash";
import config from "../config/environment";
import ApiService from "./api-base-service";

const { PRELOAD_TYPES, PRELOAD_AUTHORIZED_TYPES } = config.APP;

/**
 * Preload service
 *
 */
export default ApiService.extend(Ember.Evented, {
  store: Ember.inject.service(),
  session: Ember.inject.service(),

  isLoggedIn: Ember.computed.alias("session.isLoggedIn"),

  preloadData: function() {
    return Ember.RSVP.all([this.loadStaticData(), this.loadUserData()]).then(
      res => {
        this.trigger("data");
        return res;
      }
    );
  },

  loadStaticData() {
    return this.fetch(PRELOAD_TYPES);
  },

  loadUserData() {
    if (!this.get("isLoggedIn")) {
      return Ember.RSVP.resolve();
    }

    return Ember.RSVP.all([
      this.get("session").loadUserProfile(),
      this.fetch(PRELOAD_AUTHORIZED_TYPES)
    ]);
  },

  fetch(type) {
    if (_.isArray(type)) {
      return Ember.RSVP.all(type.map(this.fetch.bind(this)));
    }
    return this.get("store").findAll(type, { backgroundReload: false });
  }
});
