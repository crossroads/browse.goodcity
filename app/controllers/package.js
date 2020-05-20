import { alias } from "@ember/object/computed";
import packageSetController from "./package_set";

export default packageSetController.extend({
  package: alias("model")
});
