import { alias } from "@ember/object/computed";
import packageSetController from "./package_set";
import { computed } from "@ember/object";

export default packageSetController.extend({
  package: alias("model"),

  isPackagePartOfSet: computed(
    "package",
    "package.packageSet.packages.[]",
    function() {
      let packageSet = this.get("package.packageSet");
      return packageSet && packageSet.get("packages").length > 1;
    }
  )
});
