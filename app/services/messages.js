import Service, { inject as service } from "@ember/service";
import { getOwner } from "@ember/application";
import AjaxPromise from "browse/utils/ajax-promise";
import _ from "lodash";

export default Service.extend({
  logger: service(),
  session: service(),
  store: Ember.inject.service(),
  subscription: Ember.inject.service(),
  unreadMessageCount: 0,

  allOrders: Ember.computed(function() {
    return this.get("store").peekAll("order");
  }),

  allMessages: Ember.computed(function() {
    return this.get("store").peekAll("message");
  }),

  unreadBookingsMessagesCount: Ember.computed(
    "allMessages.[]",
    "allMessages.@each{state,messageableType}",
    "allOrders.[]",
    "allOrders.@each{isAppointment}",
    function() {
      let unreadMessages = this.get("allMessages")
        .filterBy("state", "unread")
        .filterBy("messageableType", "Order");
      let bookings = this.get("allOrders").filterBy("isAppointment", true);
      let bookingIds = _.map(bookings, "id");
      let bookingMessages = _.filter(
        unreadMessages,
        msg => bookingIds.indexOf(msg.get("messageableId")) >= 0
      );

      return bookingMessages.length;
    }
  ),

  unreadOrdersMessagesCount: Ember.computed(
    "allMessages.[]",
    "allMessages.@each{state,messageableType}",
    "allOrders.[]",
    "allOrders.@each{isAppointment}",
    function() {
      let unreadMessages = this.get("allMessages")
        .filterBy("state", "unread")
        .filterBy("messageableType", "Order");
      let bookings = this.get("allOrders").filterBy("isAppointment", false);
      let bookingIds = _.map(bookings, "id");
      let bookingMessages = _.filter(
        unreadMessages,
        msg => bookingIds.indexOf(msg.get("messageableId")) >= 0
      );

      return bookingMessages.length;
    }
  ),

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

  async fetchOfferResponseMessages() {
    await this._queryMessages(["offer_response"])
      .then(data => {
        this.get("store").pushPayload(data);
      })
      .catch(e => this._onError(e));
  },

  async fetchUnreadMessages() {
    await this._queryMessages(["order", "offer_response"], "unread")
      .then(data => {
        this.get("store").pushPayload(data);
        const count = (data.messages && data.messages.length) || 0;
        this.set("unreadMessageCount", count);
      })
      .catch(e => this._onError(e));
  },

  _queryMessages(scope, state, page, perPage) {
    return new AjaxPromise("/messages", "GET", this.get("session.authToken"), {
      state: state,
      scope: scope,
      page: page,
      per_page: perPage
    });
  },

  queryNotifications(page, state) {
    const params = {
      page: page,
      state: state,
      messageable_type: ["Order", "OfferResponse"]
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
