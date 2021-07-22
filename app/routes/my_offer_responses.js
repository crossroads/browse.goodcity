import MyOrdersRoute from "./my_orders";

export default MyOrdersRoute.extend({
  model() {
    return this.store.query("offer_response", {
      offer_response: { user_id: this.get("session.currentUser").id }
    });
  }
});
