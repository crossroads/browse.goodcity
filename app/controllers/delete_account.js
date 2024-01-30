import Ember from "ember";
import asyncTasksMixin from "../mixins/async_tasks";
import AjaxPromise from "browse/utils/ajax-promise";
import { computed } from "@ember/object";
import { alias } from "@ember/object/computed";
import Controller from "@ember/controller";

export default Controller.extend(asyncTasksMixin, {
  user: alias("model.user"),
  application: Ember.inject.controller(),

  orders: computed(function() {
    return this.store.peekAll("order");
  }),

  activeOrdersCount: computed("orders.@each.state", function() {
    const inactiveStates = ["draft", "cancelled", "closed"];
    const filteredOrders = this.get("orders").filter(
      order => !inactiveStates.includes(order.get("state"))
    );
    const count = filteredOrders.length;
    return count;
  }),

  canDeleteAccount: computed("activeOrdersCount", function() {
    return this.get("activeOrdersCount") === 0;
  }),

  actions: {
    viewOrders() {
      this.transitionToRoute("my_bookings");
    },

    cancelAccountDeletion() {
      this.transitionToRoute("my_account");
    },

    async confirmDeleteAccount() {
      const userId = this.get("user.id");
      await this.runTask(
        new AjaxPromise(
          `/users/${userId}`,
          "DELETE",
          this.get("session.authToken")
        )
      );
      this.get("application").send("logMeOut");
    }
  }
});
