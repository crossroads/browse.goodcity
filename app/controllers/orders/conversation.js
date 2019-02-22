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
      values.designation = this.get('model');
      values.createdAt = new Date();
      values.isPrivate = this.get('isPrivate');
      values.sender = this.store.peekRecord("user", this.get("session.currentUser.id"));
      this.createMessage(values);

      // Animate and scroll to bottom
      Ember.$("body").animate({
        scrollTop: Ember.$(document).height()
      }, 1000);
    }
  }
});
