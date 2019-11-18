import { alias } from "@ember/object/computed";
import itemController from "./item";

export default itemController.extend({
  package: alias("model")
});
