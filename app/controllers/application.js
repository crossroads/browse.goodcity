import applicationController from "./application_root";

export default applicationController.extend({
  init() {
    this._super(...arguments);

    if (!this.isSubscribed) {
      this.get("subscription").wire();
      this.isSubscribed = true;
    }
  }
});
