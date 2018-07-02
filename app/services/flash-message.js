import Ember from 'ember';

export default Ember.Service.extend({
  i18n: Ember.inject.service(),

  //Need to pass message to show
  show(message) {
    var element = Ember.$("#flash_message").clone().text(this.get("i18n").t(message));
    Ember.$(".flash_message_block").addClass("visible");
    element.prependTo(".flash_message_block");
    Ember.run.debounce(this, this.hideFlashMessage, 500);
  },

  hideFlashMessage() {
    Ember.$(".flash_message_block").fadeOut(3000);
    Ember.run.debounce(this, this.removeFlashMessage, 2500);
  },

  removeFlashMessage() {
    Ember.$(".flash_message_block").empty();
    Ember.$(".flash_message_block").addClass("visible");
  }
});
