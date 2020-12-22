import { inject as service } from "@ember/service";
import { getWithDefault } from "@ember/object";
import Component from "@ember/component";

export default Component.extend({
  store: service(),
  locationName: "",

  didReceiveAttrs() {
    this._super(...arguments);
    const location = this.get("store").peekRecord(
      "district",
      this.get("record").district_id
    );
    this.set("locationName", getWithDefault(location, "name", "N/A"));
    this.set("initialItems", this.get("record").items.slice(0, 4));
  }
});
