import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  findRecord(store, type, id, snapshot) {
    if (snapshot.adapterOptions.includePackages) {
      let url = this.buildURL(type.modelName, id, snapshot, 'findRecord');
      let query = { include_packages: snapshot.adapterOptions.includePackages };
      return this.ajax(url, 'GET', { data: query });
    } else {
      this._super(...arguments);
    }
  }
});
