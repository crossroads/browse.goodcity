import Ember from "ember";

export default Ember.Controller.extend({
  actions: {
    saveAccount(){
      this.transitionToRoute("browse")
    }
  }
});
