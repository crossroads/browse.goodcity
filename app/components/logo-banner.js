
import Ember from "ember";
import config from '../config/environment';

export default Ember.Component.extend({
    isCordova: config.cordova.enabled
});
