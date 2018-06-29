/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'browse',
    environment: environment,
    baseURL: '/',
    defaultLocationType: 'auto',

    'emberRollbarClient': {
      enabled: environment !== 'test' && environment !== 'development',
      accessToken: 'f6ae344aa2b143009c619a6c775e3343',
      verbose: true,
      ignoredMessages: ["TransitionAborted"],
      payload: {
        client: {
          javascript: {
            source_map_enabled: true, //this is now true by default
            code_version: require('child_process').execSync('git rev-parse HEAD').toString().trim(),
            // Optionally have Rollbar guess which frames the error was thrown from
            // when the browser does not provide line and column numbers.
            environment: environment,
            guess_uncaught_frames: false
          }
        }
      }
    },

    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    contentSecurityPolicy: {
      "img-src": "'self' data: https://res.cloudinary.com",
      "script-src": "'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src": "'self' 'unsafe-inline' https://maxcdn.bootstrapcdn.com",
      "font-src": "'self' data: https://maxcdn.bootstrapcdn.com",
      "object-src": "'self'"
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      // Here you can pass flags/options to your application instance
      // when it is created
      NAME: 'browse.goodcity',
      CLOUD_NAME: 'ddoadcjjl',
      CLOUD_API_KEY: 926849638736153,
      CLOUD_URL: 'https://api.cloudinary.com/v1_1/ddoadcjjl/auto/upload',
      IMAGE_PATH: 'http://res.cloudinary.com/ddoadcjjl/image/upload/',
      // RESTAdapter Settings
      NAMESPACE: 'api/v1',
      HK_COUNTRY_CODE: '+852',
      PRELOAD_TYPES: ["package_type", "district", "territory", "package_category", "donor_condition", "package"],
      PRELOAD_AUTHORIZED_TYPES: ["order", "gogovan_transport"],

      SHA: process.env.APP_SHA || "00000000",
      VERSION: "1.0.0"
    },

    i18n: {
      defaultLocale: 'en'
    },
    cordova: {
      rebuildOnChange: false,
      emulate: false
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;

    // RESTAdapter Settings
    ENV.APP.SOCKETIO_WEBSERVICE_URL = 'http://localhost:1337/goodcity';
    ENV.APP.API_HOST_URL = 'http://localhost:3000';

    ENV.contentSecurityPolicy["connect-src"] = [
      'http://localhost:4202',
      'http://localhost:3000',
      'http://localhost:1337',
      'https://api.cloudinary.com',
      'ws://localhost:1337',
      'wss://localhost:1337',
    ].join(' ');
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'auto';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';

    // RESTAdapter Settings
    ENV.APP.API_HOST_URL = 'http://localhost:4202';

    ENV.APP.PRELOAD_TYPES = [];
  }

  if (environment === 'production') {

    ENV.APP.API_HOST_URL = 'https://api.goodcity.hk';
    ENV.APP.SOCKETIO_WEBSERVICE_URL = 'https://socket.goodcity.hk:81/goodcity';

    ENV.contentSecurityPolicy["connect-src"] = [
      'https://app.goodcity.hk',
      'https://api.goodcity.hk',
      'https://socket.goodcity.hk:81',
      'ws://socket.goodcity.hk:81',
      'wss://socket.goodcity.hk:81',
      'https://api.cloudinary.com'
    ].join(' ');

    if (process.env.staging === 'true') {
      ENV.staging = true;
      ENV.APP.API_HOST_URL = 'https://api-staging.goodcity.hk';
      ENV.APP.SOCKETIO_WEBSERVICE_URL = 'https://socket-staging.goodcity.hk:81/goodcity';

      ENV.contentSecurityPolicy["connect-src"] = [
        'https://app-staging.goodcity.hk',
        'https://api-staging.goodcity.hk',
        'https://socket-staging.goodcity.hk:81',
        'ws://socket-staging.goodcity.hk:81',
        'wss://socket-staging.goodcity.hk:81',
        'https://api.cloudinary.com'
      ].join(' ');
    }
  }

  ENV.APP.SERVER_PATH  = ENV.APP.API_HOST_URL + '/' + ENV.APP.NAMESPACE;

  return ENV;
};
