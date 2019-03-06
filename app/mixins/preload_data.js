import Ember from 'ember';
import config from '../config/environment';
import AjaxPromise from './../utils/ajax-promise';

export default Ember.Mixin.create({

  preloadData: function() {
    var promises = [];
    var retrieve = types => types.map(type => this.store.findAll(type, { backgroundReload: false }));

    promises = retrieve(config.APP.PRELOAD_TYPES);

    if (this.get("session.authToken")) {
      promises.push(
        new AjaxPromise("/auth/current_user_profile", "GET", this.session.get("authToken"))
          .then(data => {
            this.store.pushPayload(data);
            this.store.pushPayload({ user: data.user_profile });
            this.notifyPropertyChange("session.currentUser");
          })
      );

      promises = promises.concat(retrieve(config.APP.PRELOAD_AUTHORIZED_TYPES));
    }

    return Ember.RSVP.all(promises);
  }
});
