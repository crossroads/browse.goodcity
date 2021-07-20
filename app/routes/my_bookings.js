import { hash } from "rsvp";
import { inject as service } from "@ember/service";
import MyOrdersRoute from "./my_orders";

export default MyOrdersRoute.extend({
  orderService: service(),

  model() {
    return hash({
      organisation: this.store.peekAll("organisation").objectAt(0),
      user: this.store.peekAll("user").objectAt(0),
      orders: this.get("orderService").fetchOrdersOfType({
        shallow: true,
        appointment: true
      })
    }).then(res => {
      return this.get("orderService")
        .loadOrderTransports()
        .then(() => res);
    });
  }
});
