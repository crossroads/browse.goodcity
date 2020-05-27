import Component from "@ember/component";
import config from "browse/config/environment";

export default Component.extend({
  fallbackRoute: "",

  actions: {
    back() {
      const fallbackRoute = this.get("fallbackRoute") || "/";
      const isRoot = location.pathname === "/";

      if (isRoot) {
        return;
      }

      const noHistory = [1, 2].includes(window.history.length);
      const deepLinked =
        document.referrer && document.referrer.indexOf(config.APP.ORIGIN) < 0;

      if (deepLinked || noHistory) {
        return this.get("router").replaceWith(fallbackRoute);
      }

      window.history.back();
    }
  }
});
