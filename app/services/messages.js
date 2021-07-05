import Service, { inject as service } from "@ember/service";
import { getOwner } from "@ember/application";
import AjaxPromise from "browse/utils/ajax-promise";

export default Service.extend({
  logger: service(),
  session: service(),
  store: Ember.inject.service(),
  subscription: Ember.inject.service(),

  unreadMessageCount: 0,

  init() {
    this._super(...arguments);
    this.get("subscription").on("change:message", this, this.onNewNotification);
  },

  onNewNotification(notification) {
    const msg = this.get("store").peekRecord("message", notification.record.id);

    if (notification.operation === "create" && msg.get("isUnread")) {
      this._incrementCount();
    } else if (
      notification.operation === "update" &&
      notification.record.state === "read"
    ) {
      this._decrementCount();
    }
  },

  markRead: function(message) {
    if (message.get("isUnread")) {
      var adapter = getOwner(this).lookup("adapter:application");
      var url = adapter.buildURL("message", message.id) + "/mark_read";
      adapter
        .ajax(url, "PUT")
        .then(data => {
          delete data.message.id;
          message.setProperties(data.message);
          this._decrementCount();
        })
        .catch(error => this.get("logger").error(error));
    }
  },

  fetchUnreadMessageCount() {
    return this._queryMessages("unread", 1, 1)
      .then(data => {
        const count = data.meta && data.meta.total_count;
        this.set("unreadMessageCount", count || 0);
      })
      .catch(e => this._onError(e));
  },

  _queryMessages(state, page, perPage) {
    return new AjaxPromise("/messages", "GET", this.get("session.authToken"), {
      state: state,
      scope: ["order", "offer_response"],
      page: page,
      per_page: perPage
    });
  },

  queryNotifications(page, state) {
    const params = {
      page: page,
      state: state,
      messageable_type: ["order", "offer_response"]
    };

    return new AjaxPromise(
      "/messages/notifications",
      "GET",
      this.get("session.authToken"),
      params
    );
  },

  markAllRead() {
    return new AjaxPromise(
      "/messages/mark_all_read",
      "PUT",
      this.get("session.authToken"),
      {
        scope: ["order", "offer_response"]
      }
    ).then(() => {
      this.get("store")
        .peekAll("message")
        .filterBy("state", "unread")
        .forEach(message => {
          message.set("state", "read");
        });
      this.set("unreadMessageCount", 0);
    });
  },

  _onError(e) {
    this.get("logger").error(e);
  },

  getRoute: function(message, notification) {
    if (message.get("isOfferResponseMessage")) {
      return [
        "offers.messages",
        notification.offerId,
        { queryParams: { uid: message.get("shareablePublicId") } }
      ];
    }

    if (message.get("isOrderMessage")) {
      return ["orders.conversation", notification.order.id];
    }
  },

  _incrementCount(step = 1) {
    const count = this.get("unreadMessageCount") + step;
    if (count < 0) {
      this.set("unreadMessageCount", 0);
    } else {
      this.set("unreadMessageCount", count);
    }
  },

  _decrementCount() {
    this._incrementCount(-1);
  }
});
