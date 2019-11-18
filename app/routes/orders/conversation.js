import { hash } from "rsvp";
import detail from "./detail";

export default detail.extend({
  model(params) {
    return hash({
      order:
        this.store.peekRecord("order", params.order_id, {
          reload: true
        }) || this.store.findRecord("order", params.order_id),
      messages: this.store.query("message", {
        order_id: params.order_id
      })
    });
  },

  afterModel(model) {
    //jshint ignore:line
    //Overriding to neglect afterModel in detail
  },

  setupController(controller, model) {
    controller.set("model", model.order);
    controller.send("markRead");
    this.controllerFor("application").set("hideHeaderBar", true);
    controller.on();
  },

  resetController(controller) {
    controller.off();
  }
});
