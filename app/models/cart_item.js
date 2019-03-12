import Ember from "ember";

const { get, computed, Object: EmberObject } = Ember;

export default EmberObject.extend({
  modelType: "",
  name: "",
  imageUrl: "",
  thumbImageUrl: "",
  available: true,

  guidProps: ["modelType", "id"],

  guid: computed("guidProps", function() {
    let guidVal = get(this, "guidProps")
      .sort()
      .map(prop => {
        return get(this, prop);
      })
      .join("-");

    return guidVal;
  }),

  toCartItem() {
    return this;
  }
});
