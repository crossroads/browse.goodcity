import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  model(params) {
    return this.store.peekRecord("package", params["order_id"]);
  }
});
