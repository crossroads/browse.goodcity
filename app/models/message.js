import Ember from 'ember';
import DS from 'ember-data';
const {
  getOwner
} = Ember;

var attr = DS.attr,
  belongsTo = DS.belongsTo;

export default DS.Model.extend({

  body: attr('string'),
  senderId: attr('number'),
  isPrivate: attr('boolean'),
  createdAt: attr('date'),
  updatedAt: attr('date'),
  state: attr('string', {
    defaultValue: 'read'
  }),
  sender: belongsTo('sender', {
    async: true
  }),
  order: belongsTo('order', {
    async: false
  }),

  myMessage: Ember.computed(function () {
    var session = getOwner(this).lookup("service:session");
    return this.get("sender.id") === session.get("currentUser.id");
  }),

  isMessage: Ember.computed('this', function () {
    return true;
  }),

  createdDate: Ember.computed(function () {
    return new Date(this.get("createdAt")).toDateString();
  }),

  isRead: Ember.computed.equal('state', 'read'),
  isUnread: Ember.computed.equal('state', 'unread')
});
