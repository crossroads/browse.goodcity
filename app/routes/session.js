import Route from "@ember/routing/route";

export default Route.extend({
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
