import Route from "@ember/routing/route";

export default Route.extend({
  beforeModel() {
    this.set("cart.checkout", true);
  }
});
