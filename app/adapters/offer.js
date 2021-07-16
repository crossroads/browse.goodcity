import Ember from "ember";
import DS from "ember-data";
import config from "browse/config/environment";

export default DS.JSONAPIAdapter.extend({
  namespace: config.APP.NAMESPACE_V2,
  host: config.APP.API_HOST_URL,
  session: Ember.inject.service(),

  headers: Ember.computed("session.authToken", function() {
    return {
      Authorization: `Bearer ${this.get("session.authToken")}`,
      "Accept-Language": this.get("session.language"),
      "X-GOODCITY-APP-NAME": config.APP.NAME,
      "X-GOODCITY-APP-VERSION": config.APP.VERSION,
      "X-GOODCITY-APP-SHA": config.APP.SHA,
      "X-GOODCITY-APP-SHARED-SHA": config.APP.SHARED_SHA
    };
  }),

  updateRecord(store, type, snapshot) {
    var data = {};
    var serializer = store.serializerFor(type.modelName);

    serializer.serializeIntoHash(data, type, snapshot, { includeId: true });

    var id = snapshot.id;
    var url = this.buildURL(type.modelName, id, snapshot, "updateRecord");

    return this.ajax(url, "PUT", { data });
  }
});
