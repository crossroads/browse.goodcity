import Controller from "@ember/controller";
import { inject as service } from "@ember/service";

export default Controller.extend({
  accountService: service(),

  actions: {
    showPhoneOverlay() {
      this.get("accountService").setOverlayVisibility(true);
    },

    //Fix: Too deeply nested component(3 levels) failing randomly(Known issue with Ember)
    //Remove when Ember is upgraded to >= 3.0
    updateErrorMessage() {
      return false;
    }
  }
});
