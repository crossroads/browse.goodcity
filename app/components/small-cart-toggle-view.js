import Ember from "ember";

export default Ember.Component.extend({
  showCartSummary: false,
  allowClick: false,

  application: Ember.computed(function() {
    return Ember.getOwner(this).lookup("controller:application");
  }),

  actions: {
    toggleCartSummary() {
      this.toggleProperty("showCartSummary");
    },
    showItemDetails(item) {
      if (!this.get("allowClick")) {
        return;
      }
      this.get("application").send("showItemDetails", item);
    }
  }
});
