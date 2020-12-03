import Ember from "ember";
import { inject as service } from "@ember/service";
import ApiService from "./api-base-service";

export default ApiService.extend({
  store: service(),

  isOpen: false,

  setOverlayVisibility(val) {
    this.set("openPackageTypeSearch", val);
  },

  packageTypeLookup() {
    return new Promise((resolve, reject) => {
      Ember.run(() => {
        this.setOverlayVisibility(true);
        this.set("onPackageTypeSelect", packageType => {
          this.setOverlayVisibility(false);
          resolve(packageType || null);
        });
      });
    });
  },

  cannedMessageLookup() {
    const deferred = Ember.RSVP.defer();

    Ember.run(() => {
      this.set("isCannedMessagesVisible", true);
      this.set("onCannedMessageSelect", text => {
        this.set("onCannedMessageSelect", _.noop);
        this.set("openLocationSearch", false);
        deferred.resolve(text || null);
      });
    });

    return deferred.promise;
  }
});
