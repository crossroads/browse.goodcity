import Ember from "ember";

export default Ember.Route.extend({
  beforeModel(transition) {
    if (!this.session.get("isLoggedIn")) {
      transition.abort();
      var loginController = this.controllerFor("login");
      loginController.set("attemptedTransition", transition);
      this.transitionTo("login");
      return false;
    }
    return true;
  }
});
