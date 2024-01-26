import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  model() {
    return Ember.RSVP.hash({
      user: this.store.peekRecord("user", this.session.get("currentUser.id"))
    });
  },

  // load orders into store to ensure our 'can delete' calculations work
  beforeModel() {
    let cachedRecords = this.store.peekAll("order");
    if (cachedRecords.get("length") === 0) {
      this.get("store").query("order", {});
    }
  }
});
