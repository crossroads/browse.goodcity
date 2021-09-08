import Controller from "@ember/controller";

export default Controller.extend({
  uid: Ember.computed.alias("model.public_uid")
});
