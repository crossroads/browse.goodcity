import Ember from "ember";
import loading from "../templates/loading";

export default Ember.Component.extend({
  layout: loading,
  classNames: ["loading-indicator"]
});
