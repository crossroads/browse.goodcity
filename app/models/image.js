import Ember from "ember";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";
import cloudinaryImage from "../mixins/cloudinary_image";

export default Model.extend(cloudinaryImage, {
  favourite: attr("boolean"),
  cloudinaryId: attr("string"),
  package: belongsTo("package", { async: false }),
  angle: attr("string"),

  imageUrl: Ember.computed("cloudinaryId", "angle", function() {
    return this.generateUrl();
  }),

  defaultImageUrl: Ember.computed("cloudinaryId", "angle", function() {
    return this.generateUrl(500, 500, true);
  }),

  thumbImageUrl: Ember.computed("cloudinaryId", "angle", function() {
    return this.generateUrl(50, 50, true);
  }),

  cartImageUrl: Ember.computed("cloudinaryId", "angle", function() {
    return this.generateUrl(80, 80, true);
  }),

  previewImageUrl: Ember.computed("cloudinaryId", "angle", function() {
    return this.generateUrl(265, 265, true);
  }),

  smallScreenPreviewImageUrl: Ember.computed(
    "cloudinaryId",
    "angle",
    function() {
      return this.generateUrl(640, 365, true);
    }
  )
});
