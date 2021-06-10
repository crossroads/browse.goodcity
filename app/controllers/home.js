import Controller from "@ember/controller";
import { inject as service } from "@ember/service";
import { computed } from "@ember/object";
import config from "../config/environment";

export default Controller.extend({
  i18n: service(),
  settings: service(),
  isMobileApp: config.cordova.enabled,
  youtubeVideo: config.APP.CROSSROADS_YOUTUBE_VIDEO,

  langShort: computed("i18n.locale", function() {
    const lang = this.get("i18n.locale");
    return /zh/.test(lang) ? "zh_tw" : "en";
  }),

  appointmentWarning: computed("langShort", function() {
    return this.get("settings").readString(
      `browse.appointment_warning_${this.get("langShort")}`
    );
  }),

  onlineOrderWarning: computed("langShort", function() {
    return this.get("settings").readString(
      `browse.online_order_warning_${this.get("langShort")}`
    );
  })
});
