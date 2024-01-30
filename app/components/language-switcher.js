import { computed } from "@ember/object";
import Component from "@ember/component";

export default Component.extend({
  isEnglish: computed("session.language", function() {
    return this.get("session.language") === "en";
  }),

  isChinese: computed("session.language", function() {
    return this.get("session.language") === "zh-tw";
  }),

  actions: {
    setLanguage(language) {
      this.set("session.language", language);
      window.location.reload();
    }
  }
});
