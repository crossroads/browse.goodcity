import { reject } from "rsvp";
import { inject as service } from "@ember/service";
import Mixin from "@ember/object/mixin";
import { getOwner } from "@ember/application";
import Ember from "ember";

export default Mixin.create({
  messageBox: service(),

  // ---- Helpers

  __tasksCount: 0,
  __loadingView: null,

  __incrementTaskCount(val = 1) {
    this.__tasksCount += val;
    if (this.__tasksCount > 0) {
      this.showLoadingSpinner();
    } else {
      this.__tasksCount = 0;
      this.hideLoadingSpinner();
    }
  },

  // --- Mixin api

  runTask(task) {
    this.__incrementTaskCount();
    return task
      .then(res => {
        this.__incrementTaskCount(-1);
        return res;
      })
      .catch(err => {
        this.__incrementTaskCount(-1);
        return reject(err);
      });
  },

  showLoadingSpinner() {
    if (Ember.testing) {
      return;
    }
    if (!this.__loadingView) {
      this.__loadingView = getOwner(this)
        .lookup("component:loading")
        .append();
    }
  },

  hideLoadingSpinner() {
    if (Ember.testing) {
      return;
    }
    if (this.__loadingView) {
      this.__loadingView.destroy();
      this.__loadingView = null;
    }
  },

  i18nAlert(key, cb) {
    this.get("messageBox").alert(this.get("i18n").t(key), cb);
  }
});
