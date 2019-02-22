import config from '../../config/environment';
import detail from './detail';

export default detail.extend({
  body: '',
  isPrivate: false,
  backLinkPath: "",
  order: Ember.computed('model', function(){
    return this.get('model');
  }),
  isMobileApp: config.cordova.enabled,
  itemIdforHistoryRoute: null,
  organisationIdforHistoryRoute: null,
  i18n: Ember.inject.service(),
  sortProperties: [
    "createdAt: asc"
  ],
  model: null,
  noMessage: Ember.computed.empty("model.messages"),

  displayChatNote: Ember.computed('noMessage', 'disabled', function () {
    return this.get("noMessage") && !this.get("disabled");
  }),

  sortedMessages: Ember.computed.sort("model.messages", "sortProperties"),

  groupedMessages: Ember.computed("sortedMessages", function () {
    return this.groupBy(this.get("sortedMessages"), "createdDate");
  }),

  groupBy: function (content, key) {
    var result = [];
    var object, value;

    content.forEach(function (item) {
      value = item.get(key);
      object = result.findBy('value', value);
      if (!object) {
        object = {
          value: value,
          items: []
        };
        result.push(object);
      }
      return object.items.push(item);
    });
    return result.getEach('items');
  },

  createMessage(values) {
    var message = this.store.createRecord("message", values);
    message.save()
      .then(() => {
        this.set("body", "");
      })
      .catch(error => {
        this.store.unloadRecord(message);
        throw error;
      });
  },

  actions: {
    sendMessage() {
      Ember.$("textarea").trigger('blur');
      var values = this.getProperties("body");
      values.order = this.get('order');
      values.isPrivate = false;
      values.createdAt = new Date();
      values.sender = this.store.peekRecord("sender", this.get("session.currentUser.id"));
      this.createMessage(values);

      // Animate and scroll to bottom
      Ember.$(".message_container").animate({
        scrollTop: Ember.$(".message_container")[0].scrollHeight
      }, 50);
    }
  }
});
