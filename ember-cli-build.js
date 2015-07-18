/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var webRelease = ['production', 'staging'].indexOf(process.env.EMBER_ENV) !== -1;

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    sourcemaps: ['js', 'css'],
    fingerprint: {
      extensions: ['js', 'css', 'png', 'jpg', 'gif', 'map'],
      enabled: webRelease
    },
    gzip: {
      keepUncompressed: true,
      extensions: ['js', 'css', 'map', 'ttf', 'ott', 'eot', 'svg'],
      enabled: webRelease
    },
    minifyCSS: {
      enabled: true
    },
    emberCliFontAwesome: {
     useCss: true
    }
  });

  app.import('bower_components/foundation/js/foundation/foundation.js');
  app.import('bower_components/jquery-placeholder/jquery.placeholder.js');
  app.import('bower_components/jquery.cookie/jquery.cookie.js');
  app.import('bower_components/modernizr/modernizr.js');

  app.import("bower_components/fontawesome/fonts/fontawesome-webfont.eot", { destDir: "fonts" });
  app.import("bower_components/fontawesome/fonts/fontawesome-webfont.svg", { destDir: "fonts" });
  app.import("bower_components/fontawesome/fonts/fontawesome-webfont.ttf", { destDir: "fonts" });
  app.import("bower_components/fontawesome/fonts/fontawesome-webfont.woff", { destDir: "fonts" });
  app.import("bower_components/fontawesome/fonts/fontawesome-webfont.woff2", { destDir: "fonts" });
  app.import("bower_components/fontawesome/fonts/FontAwesome.otf", { destDir: "fonts" });

  return app.toTree();
};
