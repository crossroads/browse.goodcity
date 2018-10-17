import AuthorizeRoute from './authorize';
import Ember from 'ember';

export default AuthorizeRoute.extend({
  isOwnSelected: Ember.computed.equal("selectedId", "own"),
});
