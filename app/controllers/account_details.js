import Ember from "ember";

export default Ember.Controller.extend({
  authenticate:Ember.inject.controller(),

  actions: {
    saveAccount(){
      // After everthying has been loaded, redirect user to requested url
      var attemptedTransition = this.get('authenticate').get('attemptedTransition');
      if (attemptedTransition) {
        this.set('attemptedTransition', null);
        attemptedTransition.retry();
      }else{
        this.transitionToRoute("browse");
      }
    }
  }
});
