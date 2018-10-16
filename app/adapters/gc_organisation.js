import Ember from 'ember';
import config from '../config/environment';
import ActiveModelAdapter from 'active-model-adapter';

export default ActiveModelAdapter.extend({
  namespace: config.APP.NAMESPACE,
  host:      config.APP.API_HOST_URL,
  session:   Ember.inject.service(),


  headers: Ember.computed("session.authToken", function(){
    return {
      "Authorization":          `Bearer ${this.get('session.authToken')}`,
      "Accept-Language":        this.get('session.language'),
      "X-GOODCITY-APP-NAME":    config.APP.NAME,
      "X-GOODCITY-APP-VERSION": config.APP.VERSION,
      "X-GOODCITY-APP-SHA":     config.APP.SHA
    };
  }),

  buildURL: function(modelName, id, snapshot, requestType) {
    if (modelName === "gc-organisation" && requestType === "query") {
      return config.APP.API_HOST_URL + "/" + config.APP.NAMESPACE + "/gc_organisations/names";
    }
    return this._super.apply(this, arguments);
  }
});
