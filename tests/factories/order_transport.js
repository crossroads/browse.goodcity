import FactoryGuy from "ember-data-factory-guy";

FactoryGuy.define("order_transport", {
  sequences: {
    id: function(num) {
      return num + 150;
    }
  },
  default: {
    id: FactoryGuy.generate("id"),
    gogovanOrderId: "1",
    gogovanTransportId: "1",
    transportType: "ggv",
    vehicleType: "self",
    scheduledAt: Date.now()
  }
});
