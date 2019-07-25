import Ember from "ember";

export default Ember.Route.extend({
  loadIfAbsent(modelName, id) {
    let store = this.get("store");
    let cachedRecord = store.peekRecord(modelName, id);
    if (cachedRecord) {
      return Ember.RSVP.resolve(cachedRecord);
    }
    return store.findRecord(modelName, id, { reload: true });
  },

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
