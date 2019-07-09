import Ember from "ember";

export default Ember.Controller.extend({
  orderId: "new_order",

  actions: {
    mergePackage() {
      const orderId =
        this.get("orderId") === "new_order" ? null : this.get("orderId");
      this.transitionToRoute("request_purpose", {
        queryParams: {
          onlineOrder: true,
          bookAppointment: false,
          orderId: orderId
        }
      });
    }
  }
});
