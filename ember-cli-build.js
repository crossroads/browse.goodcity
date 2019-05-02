/* global require, module */
var EmberApp = require("ember-cli/lib/broccoli/ember-app");
var webRelease =
  ["production", "staging"].indexOf(process.env.EMBER_ENV) !== -1;

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    sourcemaps: {
      enabled: true,
      extensions: ["js"]
    },
    minifyJS: {
      options: {
        exclude: ["**/*.js"]
      }
    },
    fingerprint: {
      extensions: ["js", "css", "png", "jpg", "gif", "map"],
      exclude: ["images/browse.png"],
      enabled: webRelease
    },
    gzip: {
      keepUncompressed: true,
      extensions: ["js", "css", "map", "ttf", "ott", "eot", "svg"],
      enabled: webRelease
    },
    minifyCSS: {
      enabled: true
    },
    emberCliFontAwesome: {
      useCss: true
    },
    "ember-cli-babel": {
      includePolyfill: true
    }
  });

  app.import("bower_components/foundation/js/foundation/foundation.js");
  app.import(
    "bower_components/foundation/js/foundation/foundation.offcanvas.js"
  );
  app.import("bower_components/jquery-placeholder/jquery.placeholder.js");
  app.import("bower_components/jquery.cookie/jquery.cookie.js");
  app.import("bower_components/modernizr/modernizr.js");

  app.import("bower_components/cloudinary/js/jquery.cloudinary.js");

  app.import("bower_components/lightgallery/src/css/lightgallery.css");
  app.import("bower_components/lightgallery/src/css/lg-transitions.css");
  app.import("bower_components/lightgallery/src/js/lightgallery.js");
  app.import("bower_components/lightgallery/src/js/lg-zoom.js");
  app.import("bower_components/lightgallery/src/fonts/lg.eot", {
    destDir: "fonts"
  });
  app.import("bower_components/lightgallery/src/fonts/lg.svg", {
    destDir: "fonts"
  });
  app.import("bower_components/lightgallery/src/fonts/lg.ttf", {
    destDir: "fonts"
  });
  app.import("bower_components/lightgallery/src/fonts/lg.woff", {
    destDir: "fonts"
  });
  app.import("bower_components/lightgallery/src/img/loading.gif", {
    destDir: "/img"
  });

  app.import("bower_components/socket.io-client/socket.io.js");
  app.import("bower_components/moment/moment.js");
  app.import("bower_components/moment-timezone/moment-timezone.js");
  app.import(
    "bower_components/moment-timezone/builds/moment-timezone-with-data.js"
  );

  // app.import('bower_components/moment/locale/zh-tw.js');

  app.import("bower_components/pickadate/lib/picker.js");
  app.import("bower_components/pickadate/lib/picker.date.js");
  app.import("bower_components/pickadate/lib/picker.time.js");
  app.import("bower_components/pickadate/lib/themes/default.css");
  app.import("bower_components/pickadate/lib/themes/default.date.css");
  app.import("bower_components/pickadate/lib/themes/default.time.css");

  return app.toTree();
};
