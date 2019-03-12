import Ember from "ember";

export default function() {
  Ember.Test.registerHelper("lookup", function(app, name) {
    return app.__container__.lookup(name);
  });
}
