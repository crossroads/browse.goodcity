import Ember from "ember";

export default Ember.Route.extend({
  beforeModel() {
    if (
      window.localStorage.getItem("authToken") &&
      this.session.get("isLoggedIn")
    ) {
      this.transitionTo("/");
    } else {
      this.set("cart.checkout", true);
    }
  }
});
