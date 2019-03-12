import Ember from "ember";

export default Ember.Route.extend({
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),

  beforeModel(transition) {
    if (!this.session.get("isLoggedIn")) {
      transition.abort();
      this.get("messageBox").alert(this.get("i18n").t("must_login"), () => {
        var loginController = this.controllerFor("login");
        loginController.set("attemptedTransition", transition);
        this.transitionTo("login");
      });
      return false;
    }
    return true;
  }
});
