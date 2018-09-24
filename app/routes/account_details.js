import Ember from "ember";
import AuthorizeRoute from './authorize';

export default AuthorizeRoute.extend({
  model(params) {
    return Ember.RSVP.hash({
      organisation: params.orgId? this.store.peekRecord('gc_organisation', parseInt(params.orgId)) : this.store.peekAll('organisation', {reload: true}).objectAt(0),
      organisationsUser: this.store.peekAll('organisations_user').objectAt(0),
      user: this.store.peekAll('user').objectAt(0)
    });
  }
});
