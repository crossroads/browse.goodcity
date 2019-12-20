import Component from "@ember/component";
import loading from "../templates/loading";

export default Component.extend({
  layout: loading,
  classNames: ["loading-indicator"]
});
