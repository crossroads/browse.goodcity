import Controller from "@ember/controller";

export default Controller.extend({
  uid: Ember.computed.alias("model.public_uid"),
  offerDistrict: Ember.computed('model', 'model.district_id', function () {
    const districtId = this.get('model.district_id');

    if (!districtId) {
      return 'Hong Kong'
    }

    return this.get('store').peekRecord("district", districtId).getWithDefault("name", "Hong Kong");
  })
});
