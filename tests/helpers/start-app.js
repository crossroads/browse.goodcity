import $ from "jquery";
import { run } from "@ember/runloop";
import { merge } from "@ember/polyfills";
import Application from "../../app";
import Router from "../../router";
import config from "../../config/environment";
import "./custom-helpers";

export default function startApp(attrs) {
  let application;
  window.localStorage.authToken =
    '"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo2LCJpYXQiOjE1MTg3NzI4MjcsImlzcyI6Ikdvb2RDaXR5SEsiLCJleHAiOjE1MTk5ODI0Mjd9.WdsVvss9khm81WNScV5r6DiIwo8CQfHM1c4ON2IACes"';

  let attributes = merge({}, config.APP);
  attributes = merge(attributes, attrs); // use defaults, but you can override;

  Router.reopen({
    location: "none"
  });

  run(() => {
    application = Application.create(attributes);
    application.__container__.lookup("service:i18n").set("locale", "en");
    application.setupForTesting();
    application.injectTestHelpers();
  });

  $("head").append(
    "<style>.loading-indicator {display:none !important;}</style>"
  );
  window.alert = function(message) {
    console.log("Alert: " + message);
  };
  window.confirm = function(message) {
    console.log("Confirm: " + message);
    return true;
  };

  return application;
}
