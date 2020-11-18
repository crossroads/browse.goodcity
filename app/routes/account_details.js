import { hash } from "rsvp";
import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  model(params) {
    var user = this.get("session.currentUser");
    var organisationsUser =
      user.get("organisationsUsers") &&
      user.get("organisationsUsers.firstObject");
    var organisation =
      organisationsUser && organisationsUser.get("organisation");

    return hash({
      organisation: params.orgId
        ? this.store.peekRecord("organisation", parseInt(params.orgId))
        : organisation,
      organisationsUser: organisationsUser,
      user: user
    });
  },

  setupController(controller, model) {
    this._super(controller, model);
    this.controllerFor("application").set("showSidebar", false);
  },

  deactivate() {
    this.controllerFor("application").set("showSidebar", true);
  }
});
