import Ember from 'ember';
import preloadDataMixin from '../mixins/preload_data';

export default Ember.Route.extend(preloadDataMixin, {

  beforeModel: function (transition = []) {
    return this.preloadData();
  },

});
