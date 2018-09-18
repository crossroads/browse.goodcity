import Ember from "ember";

export default Ember.Controller.extend({

  actions: {
    selectOrganisation(){
      this.transitionToRoute("account_details");
    }
  }
});
