import { inject as service } from "@ember/service";
import { getWithDefault } from "@ember/object";
import Component from "@ember/component";
import _ from "lodash";

export default Component.extend({
  store: service(),
  locationName: "",

  didReceiveAttrs() {
    this._super(...arguments);
    console.log(this.get("record"));
    const location = this.get("store").peekRecord(
      "district",
      this.get("record").district_id
    );
    this.getPackageTypesCounts(this.get("record").items);
    this.set("locationName", getWithDefault(location, "name", "N/A"));
    this.set("initialItems", this.get("record").items.slice(0, 4));
  },

  getPackageTypesCounts(items) {
    const counts = _.reduce(
      items,
      (results, item) => {
        const packageType = this.get("store").peekRecord(
          "package_type",
          item.attributes.package_type_id
        );
        const packageTypeName = getWithDefault(packageType, "name", "N/A");
        const count = _.get(results, packageTypeName, 0);
        _.set(results, packageTypeName, count + 1);
        return results;
      },
      {}
    );

    this.set("typesCounts", counts);
  }
});
