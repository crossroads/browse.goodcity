import Ember from 'ember';
import AjaxPromise from '../utils/ajax-promise';
import config from '../config/environment';

export default Ember.Mixin.create({

  preloadData: function() {
    var promises = [];
    var retrieve = types => types.map(type => this.store.findAll(type));

    promises = retrieve(config.APP.PRELOAD_TYPES);

    promises.push(
      new AjaxPromise("/items/browse", "GET")
        .then(data => { this.store.pushPayload(data); })
        .catch(error => alert(error))
    );

    return Ember.RSVP.all(promises);
  }
});
