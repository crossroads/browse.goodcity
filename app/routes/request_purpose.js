import { inject as service } from "@ember/service";
import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  orderId: null,
  order: null,
  isBookAppointment: null,
  session: service(),
  orderService: service(),

  beforeModel(transition) {
    if (!this._super(...arguments)) {
      return; // not authorized
    }

    let isAppointment = transition.queryParams.bookAppointment === "true",
      editRequest = transition.queryParams.editRequest === "true";
    this.set("editRequest", editRequest);
    this.set("isBookAppointment", isAppointment);
    this.set("orderId", transition.queryParams.orderId);
  },

  model() {
    const orderId = this.get("orderId");
    const isAppointment = this.get("isBookAppointment");
    const loadTask = orderId
      ? this.loadIfAbsent("order", orderId)
      : this.get("orderService").getLastDraft({ appointment: isAppointment });

    return loadTask.then(order => {
      this.set("order", order);
      return order;
    });
  },

  setUpFormData(model, controller) {
    let order = this.get("order");

    if (!order) {
      controller.set("selectedDistrict", null);
      controller.set("peopleCount", null);
      controller.set("description", null);
      controller.set("selectedId", "organisation");
      return;
    }

    let ordersPurposes = order.get("ordersPurposes");

    if (ordersPurposes.get("length")) {
      controller.set(
        "selectedId",
        ordersPurposes.get("firstObject").get("purpose.identifier")
      );
    }

    controller.set("selectedDistrict", order.get("district"));
    controller.set("peopleCount", order.get("peopleHelped"));
    controller.set("description", order.get("purposeDescription"));
    controller.set("isEditing", !order.get("isDraft"));
  },

  setupController(controller, model, transition) {
    this._super(...arguments);

    controller.set("isEditing", false);
    this.setUpFormData(model, controller, transition);
    this.controllerFor("application").set("showSidebar", false);
    controller.set("model", this.get("order"));
  },

  deactivate() {
    this.controllerFor("application").set("showSidebar", true);
  }
});
