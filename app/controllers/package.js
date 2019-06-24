import Ember from "ember";
import itemController from "./item";

export default itemController.extend({
  package: Ember.computed.alias("model")
});
