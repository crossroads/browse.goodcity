import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  setupController() {
    this.controllerFor("application").set("showSidebar", false);
  }
});
