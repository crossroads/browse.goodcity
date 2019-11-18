import { registerHelper } from "@ember/test";

export default function() {
  registerHelper("lookup", function(app, name) {
    return app.__container__.lookup(name);
  });
}
