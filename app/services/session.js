import Ember from 'ember';
import '../computed/local-storage';

export default Ember.Service.extend({
  authToken: Ember.computed.localStorage(),
  otpAuthKey: Ember.computed.localStorage(),
  isLoggedIn: Ember.computed.notEmpty("authToken"),
  language: Ember.computed.localStorage(),
  store: Ember.inject.service(),

  currentUser: Ember.computed(function(){
    var store = this.get('store');
    return store.peekAll('user').get('firstObject') || null;
  }).volatile(),

  clear() {
    this.set("authToken", null);
    this.set("otpAuthKey", null);
  },

  draftOrder: Ember.computed("allOrders.@each.state", function(){
    return this.get("allOrders").filterBy("state", "draft").get("firstObject");
  }),

  allOrders: Ember.computed(function(){
    return this.get("store").peekAll("order");
  })
});
