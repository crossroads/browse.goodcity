import { inject as service } from "@ember/service";
import { getWithDefault, computed } from "@ember/object";
import Component from "@ember/component";
import cloudinaryImage from "../mixins/cloudinary_image";
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

export default Component.extend(cloudinaryImage, {
  store: service(),

  didReceiveAttrs() {
    this._super(...arguments);

    this.get("items").forEach(item => {
      const packageTypeName = this.typeOf(item);
      _.set(item, "packageTypeName", packageTypeName);
      const chineseDescription = (
        safeGet(item, "notes_zh_tw", null) || ""
      ).trim();
      if (this.get("i18n.locale") === "zh-tw" && !!chineseDescription) {
        _.set(item, "description", chineseDescription);
      } else {
        _.set(item, "description", safeGet(item, "notes", null));
      }
    });
  },

  locationName: computed("district", function() {
    const id = this.get("district");
    const district = this.get("store").peekRecord("district", id);

    return safeGet(district, "name", DEFAULT_LOCATION_NAME);
  }),

  items: computed.alias("record.items"),

  initialItems: computed("record", "record.id", "items.[]", function() {
    return getWithDefault(this, "items", []);
  }),

  typeOf(item) {
    const ptid = safeGet(item, "package_type_id", null);
    const packageType = this.get("store").peekRecord("package_type", ptid);

    return safeGet(packageType, "name", NA);
  }
});
