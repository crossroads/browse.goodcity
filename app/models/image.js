import { computed } from "@ember/object";
import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo } from "ember-data/relationships";
import cloudinaryImage from "../mixins/cloudinary_image";

export default Model.extend(cloudinaryImage, {
  favourite: attr("boolean"),
  cloudinaryId: attr("string"),
  package: belongsTo("package", { async: false }),
  angle: attr("string"),

  imageUrl: computed("cloudinaryId", "angle", function() {
    return this.generateUrl();
  }),

  defaultImageUrl: computed("cloudinaryId", "angle", function() {
    return this.generateUrl(500, 500, true);
  }),

  thumbImageUrl: computed("cloudinaryId", "angle", function() {
    return this.generateUrl(50, 50, true);
  }),

  miniImageUrl: computed("cloudinaryId", "angle", function() {
    return this.generateUrl(30, 30, true);
  }),

  cartImageUrl: computed("cloudinaryId", "angle", function() {
    return this.generateUrl(80, 80, true);
  }),

  previewImageUrl: computed("cloudinaryId", "angle", function() {
    return this.generateUrl(265, 265, true);
  }),

  smallScreenPreviewImageUrl: computed("cloudinaryId", "angle", function() {
    return this.generateUrl(640, 365, true);
  })
});
