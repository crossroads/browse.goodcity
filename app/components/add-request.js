import Ember from "ember";
const { getOwner } = Ember;
import AjaxPromise from 'browse/utils/ajax-promise';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  request: null,
  num: null,
  order: null,

  packageTypeName: Ember.computed('request.packageType.name', function(){
    return this.get('request.packageType.name');
  }),

  actions: {
    deleteRequest(reqId) {
      this.get("messageBox").custom(
        "Remove this request from order " + this.get("model.code"),
        "Remove", () => this.send("removeRequest", reqId),
        "Not Now"
      );
    },

    removeRequest(reqId) {
        var url = `/goodcity_requests/${reqId}`;
        var req = this.get("store").peekRecord("goodcity_request", reqId);
        var loadingView = getOwner(this).lookup('component:loading').append();
        new AjaxPromise(url, "DELETE", this.get('session.authToken'))
          .then(data => {
            this.get("store").pushPayload(data);
          })
          .finally(() => {
            loadingView.destroy();
            this.get("store").unloadRecord(req);
          });
      },
  }
});