import detail from "./detail";

export default detail.extend({
  model(params) {
    return this._super(...arguments).then(data => {
      data.gcRequests = this.get("store").query("goodcity_request", {
        order_ids: params.order_id
      });
      return Ember.RSVP.hash(data);
    });
  }
});
