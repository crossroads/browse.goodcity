import Mixin from "@ember/object/mixin";
import { getWithDefault } from "@ember/object";

export default Mixin.create({
  safeGet: function(model, id, attr, defaultValue = "N/A") {
    if (!attr || !id || !model) {
      return defaultValue;
    }

    const record = this.get("store").peekRecord(model, id);
    return getWithDefault(record, attr, defaultValue);
  }
});
