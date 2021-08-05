import applicationController from './application';

export default applicationController.extend({

  actions: {
    displayCart() {
      this.transitionToRoute("/");
    }
  }

});
