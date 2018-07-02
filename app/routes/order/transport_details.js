import Ember from 'ember';
import AuthorizeRoute from './../authorize';

export default AuthorizeRoute.extend({
  model() {
    var orderId = this.paramsFor('order').order_id;
    var order = this.store.peekRecord('order', orderId);

    return Ember.RSVP.hash({
      organisation: this.store.peekAll('organisation').objectAt(0),
      user: this.store.peekAll('user').objectAt(0),
      order: order || this.store.findRecord('order', orderId)
    });
  },

  setUpGgvData(model, orderTransport, controller) {
    var ggvOrderTransport = orderTransport.get("gogovanTransport");
    controller.set("selectedId", "ggv");
    controller.set("speakEnglish", orderTransport.get("needEnglish"));
    controller.set("borrowTrolley", orderTransport.get("needCart"));
    controller.set("porterage", orderTransport.get("needCarry"));
    controller.set("longerGoods", orderTransport.get("needOverSixFt"));
    controller.set("longGoodSelection", orderTransport.get("removeNet"));
    if(ggvOrderTransport) {
      switch (ggvOrderTransport.get("name")) {
      case "van":
        controller.set("selectedGogovanOption", "1");
        break;
      case "5.5 Tonne Truck":
        controller.set("selectedGogovanOption", "2");
        break;
      case "9 Tonne Truck":
        controller.set("selectedGogovanOption", "3");
        break;
      }
    }
  },

  setTimeslot(orderTransport, controller) {
    var timeslot = orderTransport.get("timeslot");
    if(timeslot.indexOf(3) >= 0) {
      controller.set("changeTime", "1" );
    } else {
      controller.set("changeTime", "2" );
    }
  },

  setUpFormData(model, controller) {
    var orderTransport = model.order.get("orderTransport");
    if(model.order && orderTransport) {
      if(orderTransport.get("transportType") === "ggv") {
        this.setUpGgvData(model, orderTransport, controller);
      } else {
        controller.set('selectedId', "self");
      }
      controller.set("changeDate", moment(orderTransport.get("scheduledAt")).format("DD MMMM YYYY"));
      this.setTimeslot(orderTransport, controller);
    } else {
      controller.set('selectedId', "self");
    }
  },

  setupController(controller, model) {
    this._super(...arguments);
    this.setUpFormData(model, controller);
  }
});
