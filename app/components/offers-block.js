import { inject as service } from "@ember/service";
import { getWithDefault, computed } from "@ember/object";
import Component from "@ember/component";
import _ from "lodash";

const NA = "N/A";
const DEFAULT_LOCATION_NAME = "Hong Kong";

function safeGet(obj, field, defaultValue) {
  if (!obj) {
    return defaultValue;
  }

  return (
    // --- Normal Ember model
    getWithDefault(obj, field, false) ||
    // --- JSON Api structure
    getWithDefault(obj, `attributes.${field}`, defaultValue)
  );
}

export default Component.extend({
  store: service(),

  locationName: computed("district", function() {
    const id = this.get("district");
    const district = this.get("store").peekRecord("district", id);

    return safeGet(district, "name", DEFAULT_LOCATION_NAME);
  }),

  items: computed.alias("record.items"),

  initialItems: computed("record", "record.id", "items.[]", function() {
    return getWithDefault(this, "items", []).slice(0, 4);
  }),

  typesCounts: computed(
    "record.id",
    "items.[]",
    "items.@each.attributes.package_type_id",
    function() {
      return _.reduce(
        this.get("items"),
        (results, item) => {
          const packageTypeName = this.typeOf(item);
          const count = _.get(results, packageTypeName, 0);
          _.set(results, packageTypeName, count + 1);
          return results;
        },
        {}
      );
    }
  ),

  typeOf(item) {
    const ptid = safeGet(item, "package_type_id", null);
    const packageType = this.get("store").peekRecord("package_type", ptid);

    return safeGet(packageType, "name", NA);
  }
});
