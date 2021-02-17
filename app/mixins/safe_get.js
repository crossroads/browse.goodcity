import Mixin from "@ember/object/mixin";
import { getWithDefault } from "@ember/object";

export default Mixin.create({
  safeGet: function(model, id, attr, defaultValue = "N/A") {
    if (!attr || !id) {
      throw new Error("Attribute or Id cannot be empty");
    }
    if (!model) {
      throw new Error("Model is not valid");
    }

    const record = this.get("store").peekRecord(model, id);
    return getWithDefault(record, attr, defaultValue);
  }
});
