import Service, { inject as service } from "@ember/service";
import { getOwner } from "@ember/application";

export default Service.extend({
  logger: service(),
  session: service(),

  markRead: function(message) {
    if (message.get("isUnread")) {
      var adapter = getOwner(this).lookup("adapter:application");
      var url = adapter.buildURL("message", message.id) + "/mark_read";
      adapter
        .ajax(url, "PUT")
        .then(data => {
          delete data.message.id;
          message.setProperties(data.message);
        })
        .catch(error => this.get("logger").error(error));
    }
  },

  getMessageRoute(orderId) {
    return ["orders.conversation", orderId];
  },

  getRoute: function(message) {
    var orderId = message.get
      ? message.get("designation.id")
      : message.designation_id;
    var messageRoute = this.getMessageRoute(orderId);
    return messageRoute;
  }
});
