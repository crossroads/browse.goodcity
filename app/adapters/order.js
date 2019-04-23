import ApplicationAdapter from "./application";
import _ from "lodash";

export default ApplicationAdapter.extend({
  findRecord(store, type, id, snapshot) {
    if (_.has(snapshot, "adapterOptions.includePackages")) {
      let url = this.buildURL(type.modelName, id, snapshot, "findRecord");
      let query = { include_packages: snapshot.adapterOptions.includePackages };
      return this.ajax(url, "GET", { data: query });
    } else {
      return this._super(...arguments);
    }
  }
});
