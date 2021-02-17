import { inject as service } from "@ember/service";
import { getWithDefault, computed } from "@ember/object";
import Component from "@ember/component";
import cloudinaryImage from "../mixins/cloudinary_image";
import safeGet from "../mixins/safe_get";
import _ from "lodash";

const DEFAULT_LOCATION_NAME = "Hong Kong";

export default Component.extend(cloudinaryImage, safeGet, {
  store: service(),

  didReceiveAttrs() {
    this._super(...arguments);

    this.get("items").forEach(item => {
      const packageTypeName = this.typeOf(item);
      _.set(item, "packageTypeName", packageTypeName);

      const chineseDescription = (
        getWithDefault(item, "attributes.notes_zh_tw", null) || ""
      ).trim();

      if (this.get("i18n.locale") === "zh-tw" && !!chineseDescription) {
        _.set(item, "description", chineseDescription);
      } else {
        _.set(
          item,
          "description",
          getWithDefault(item, "attributes.notes", "")
        );
      }
    });
  },

  locationName: computed("district", function() {
    const id = this.get("district");
    return this.safeGet("district", id, "name", DEFAULT_LOCATION_NAME);
  }),

  items: computed.alias("record.items"),

  initialItems: computed("record", "record.id", "items.[]", function() {
    return getWithDefault(this, "items", []);
  }),

  typeOf(item) {
    const ptid = getWithDefault(item, "attributes.package_type_id", null);
    return this.safeGet("packageType", ptid, "name");
  }
});
