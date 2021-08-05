import applicationController from "./application_root";

export default applicationController.extend({
  actions: {
    displayCart() {
      this.transitionToRoute("/");
    }
  }
});
