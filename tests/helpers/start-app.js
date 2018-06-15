import Ember from 'ember';
import Application from '../../app';
import Router from '../../router';
import config from '../../config/environment';
import './custom-helpers';

export default function startApp(attrs) {
  let application;
  let attributes = Ember.merge({}, config.APP);
  attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

  Router.reopen({
    location: 'none'
  });

  Ember.run(() => {
    application = Application.create(attributes);
    application.__container__.lookup('service:i18n').set("locale", "en");
    application.setupForTesting();
    application.injectTestHelpers();
  });

  Ember.$("head").append("<style>.loading-indicator {display:none !important;}</style>");
  window.alert = function(message) { console.log("Alert: " + message); };
  window.confirm = function(message) { console.log("Confirm: " + message); return true; };

  return application;
}
