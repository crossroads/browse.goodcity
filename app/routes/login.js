import SessionRoute from "./session";

export default SessionRoute.extend({
  controllerName: "authenticate",

  setupController(controller, model) {
    this._super(...arguments);
    controller.set("mobile", null);
    controller.set("email", null);
  }
});
